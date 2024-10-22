import type { calendar_v3 } from 'googleapis';
import type { CalendarKey, CalendarResponse } from '../../src-gcal/types.ts';
import type { Binding } from 'resource:///com/github/Aylur/ags/service.js';
export type { CalendarResponse } from '../../src-gcal/types.ts';

export const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface CalendarDay {
	id: string;
	date: number;
	today: boolean;
	in_month: boolean;
	selected: boolean;
}

export interface CalendarWeek {
	days: CalendarDay[];
	woty: number;
}

export function date_to_id(date: Date) {
	const day = date.getDate();
	const month = date.getMonth();
	const year = date.getFullYear();

	return [day, month, year].join('-');
}

export function dmy_to_id(day: number, month: number, year: number) {
	return date_to_id(new Date(year, month, day));
}

export function today_id() {
	return date_to_id(new Date());
}

export function id_to_date(id: string): Date {
	const [day, month, year] = id.split('-').map(Number);
	return new Date(year, month, day);
}

export function first_dotw(month: number, year: number) {
	return new Date(year, month, 1).getDay();
}

export function days_in(month: number, year: number) {
	return new Date(year, month + 1, 0).getDate();
}

export function woty(date: Date) {
	const first = new Date(date.getFullYear(), 0, 1);
	const diff = date.getTime() - first.getTime();
	const week = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));

	return week;
}

function last_end(month: number, year: number, selected: string): CalendarDay[] {
	const begin_dotw = first_dotw(month, year);
	const prepend_days = begin_dotw == 0 ? 7 : begin_dotw;
	const prepend_last = days_in(month - 1, year);
	const prepend_begin = prepend_last - prepend_days + 1;

	const days = [] as CalendarDay[];

	for (let i = 0; i < prepend_days; i++) {
		const id = dmy_to_id(prepend_begin + i, month - 1, year);

		days.push({
			id,
			date: prepend_begin + i,
			today: false,
			in_month: false,
			selected: selected == id,
		});
	}

	return days;
}

function all_days(month: number, year: number, selected: string): CalendarDay[] {
	const days = last_end(month, year, selected);
	const num_days = days_in(month, year);

	for (let i = 1; i <= num_days; i++) {
		const id = dmy_to_id(i, month, year);
		const today = new Date();

		days.push({
			id,
			date: i,
			today: i == today.getDate() && month == today.getMonth() && year == today.getFullYear(),
			in_month: true,
			selected: selected == id,
		});
	}

	const next_days = (6 * 7) - days.length;

	for (let i = 1; i <= next_days; i++) {
		const id = dmy_to_id(i, month + 1, year);

		days.push({
			id,
			date: i,
			today: false,
			in_month: false,
			selected: selected == id,
		});
	}

	return days;
}

/// Get 1-53 week of the year based on the woty of the first day in the month
function first_woty(month: number, year: number): number {
	const first = new Date(year, month, 1);
	const first_woty = Utils.exec(`date -d "${first.toISOString()}" +%V`);

	return parseInt(first_woty);
}

function generate_month(month: number, year: number, selected: string): CalendarWeek[] {
	const days = all_days(month, year, selected);
	const weeks = [] as CalendarWeek[];
	const woty = first_woty(month, year);

	for (let i = 0; i < days.length; i += 7) {
		weeks.push({
			days: days.slice(i, i + 7),
			woty: woty + (i / 7),
		});
	}

	return weeks;
}

function ago(other: Date | undefined) {
	return new Date().getTime() - (other?.getTime() ?? 0);
}

function id_to_key(id: string): CalendarKey {
	const [_, month, year] = id.split('-').map(Number);
	return { month, year };
}

function date_to_key(date: Date): CalendarKey {
	return { month: date.getMonth(), year: date.getFullYear() };
}

export function filter_date(d: Date): (_: calendar_v3.Schema$Event) => boolean {
	return (ev) => {
		if (!ev.end || !ev.start) return false;

		if (ev.end.date) {
			const evday = new Date(ev.end.date);
			return evday.getDate() == d.getDate() && evday.getMonth() == d.getMonth();
		}

		const start = new Date(ev.start.dateTime!);
		const end = new Date(ev.end.dateTime!);

		if (end.getTime() > d.getTime() && start.getTime() < d.getTime()) return true;
		return start.getDate() == d.getDate() && start.getMonth() == d.getMonth();
	};
}

export function filter_id(s: string): (_: calendar_v3.Schema$Event) => boolean {
	return filter_date(id_to_date(s));
}

class GoogleCalendarManager {
	#cache = new Map<string, CalendarResponse>();

	register(response: CalendarResponse) {
		this.#cache.set(JSON.stringify(response.key), response);
	}

	get(key: CalendarKey) {
		return this.#cache.get(JSON.stringify(key));
	}

	has(key: CalendarKey) {
		return this.#cache.has(JSON.stringify(key));
	}

	remove(key: CalendarKey) {
		this.#cache.delete(JSON.stringify(key));
	}
}

export interface CalendarServiceData {
	selected: string;
	weeks: CalendarWeek[];
	header: string;
	gcal: CalendarResponse | undefined;
}

class CalService extends Service {
	static {
		Service.register(
			this,
			{},
			{
				data: ['gobject', 'r'],
			},
		);
	}

	#month = 0;
	#year = 0;
	#selected = today_id();
	#google = new GoogleCalendarManager();

	constructor() {
		super();
		this.reset();

		Utils.interval(1000 * 60 * 60, () => {
			this.#update_gcal();
		});
	}

	get data(): CalendarServiceData {
		const header = () => {
			if (this.#year == new Date().getFullYear()) return Months[this.#month];
			else return `${Months[this.#month]} ${this.#year}`;
		};
		return {
			selected: this.#selected,
			weeks: generate_month(this.#month, this.#year, this.#selected),
			header: header(),
			gcal: this.#google.get({
				month: this.#month,
				year: this.#year,
			}),
		};
	}

	get curmonth() {
		return this.#month;
	}

	get curyear() {
		return this.#year;
	}

	#notify() {
		this.notify('data');
	}

	#fetch_gcal() {
		const date = id_to_date(this.#selected);

		this.#google.remove(date_to_key(date));
		this.#notify();

		const command = `nu -c 'cd ${App.configDir}; echo "${id_to_date(this.#selected).toISOString()}" | bun run --silent gcal'`;

		Utils.execAsync(command)
			.then(JSON.parse)
			.then((output: CalendarResponse) => {
				this.#google.register({
					...output,
					generated: new Date(output.generated),
				});
				this.#notify();
			})
			.catch(console.error);
	}

	#update_gcal() {
		const key = id_to_key(this.#selected);

		if (this.#google.has(key) && ago(this.#google.get(key)!.generated) <= 1000 * 60 * 60) {
			this.#notify();
			return;
		}

		this.#fetch_gcal();
	}

	#on_month_change() {
		if (new Date().getMonth() == this.#month) this.#selected = date_to_id(new Date());
		else this.#selected = `1-${this.#month}-${this.#year}`;

		this.#on_day_change();
	}

	#on_day_change() {
		this.#update_gcal();
		this.#notify();
	}

	previous() {
		if (this.#month == 0) this.#month = 11, this.#year--;
		else this.#month--;

		this.#on_month_change();
	}

	next() {
		if (this.#month == 11) this.#month = 0, this.#year++;
		else this.#month++;

		this.#on_month_change();
	}

	reset() {
		this.#month = new Date().getMonth();
		this.#year = new Date().getFullYear();

		this.#on_month_change();
	}

	select(day: string) {
		if (day == today_id() && this.#selected == today_id()) return;
		else if (day == this.#selected) this.#on_month_change();
		else this.#selected = day;

		this.#on_day_change();
	}

	force_refresh() {
		this.#fetch_gcal();
	}

	bindkey<T extends keyof CalendarServiceData>(key: T): Binding<this, any, CalendarServiceData[T]> {
		return this.bind('data' as any).transform(data => data[key]);
	}

	bindkeys<T extends keyof CalendarServiceData>(...keys: T[]): Binding<this, any, Pick<CalendarServiceData, T>> {
		return this.bind('data' as any).transform(data => Object.fromEntries(keys.map(key => [key, data[key]])) as Pick<CalendarServiceData, T>);
	}
}

export const CalendarService = new CalService();
