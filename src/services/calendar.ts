import type { CalendarResponse } from '../../src-gcal/response.ts';
export type { CalendarResponse } from '../../src-gcal/response.ts';

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

function makeid(day: number, month: number, year: number) {
	return `${day}-${month}-${year}`;
}

function idfromdate(date: Date) {
	return makeid(date.getDate(), date.getMonth(), date.getFullYear());
}

function today_id() {
	return idfromdate(new Date());
}

export function makedate(id: string): Date {
	const [day, month, year] = id.split('-').map(Number);
	return new Date(year, month, day);
}

function first_day(month: number, year: number) {
	return new Date(year, month, 1).getDay();
}

function days_in(month: number, year: number) {
	if (month == 11) month = 0, year++;
	else month++;

	return new Date(year, month, 0).getDate();
}

function last_end(month: number, year: number, selected: string): CalendarDay[] {
	const day = first_day(month, year);
	const num_days = day == 0 ? 7 : day;
	const prev_month_days = month == 0 ? days_in(11, year - 1) : days_in(month - 1, year);
	const begin_day = prev_month_days - num_days + 1;

	const days = [] as CalendarDay[];

	for (let i = 0; i < num_days; i++) {
		const id = month == 0 ? makeid(begin_day + i, 11, year - 1) : makeid(begin_day + i, month - 1, year);

		days.push({
			id,
			date: begin_day + i,
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
		const id = makeid(i, month, year);

		days.push({
			id,
			date: i,
			today: i == new Date().getDate() && month == new Date().getMonth() && year == new Date().getFullYear(),
			in_month: true,
			selected: selected == id,
		});
	}

	const next_days = (6 * 7) - days.length;

	for (let i = 1; i <= next_days; i++) {
		const id = month == 11 ? makeid(i, 0, year + 1) : makeid(i, month + 1, year);

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

class CalendarService extends Service {
	static {
		Service.register(
			this,
			{},
			{
				selected: ['string', 'r'],
				data: ['gobject', 'r'],
				header: ['string', 'r'],
				gcal: ['gobject', 'r'],
			},
		);
	}

	#month = 0;
	#year = 0;
	#selected_val: string = today_id();
	#gcal_val: CalendarResponse | undefined = undefined;
	#gcal_cache = new Map<string, [Date, CalendarResponse]>();

	constructor() {
		super();
		this.datereset();
	}

	get selected() {
		return this.#selected_val;
	}

	get data() {
		return generate_month(this.#month, this.#year, this.selected);
	}

	get header() {
		if (this.#year == new Date().getFullYear()) return Months[this.#month];
		else return `${Months[this.#month]}  ${this.#year}`;
	}

	get gcal() {
		return this.#gcal_val;
	}

	#reselect() {
		if (new Date().getMonth() == this.#month) this.#selected_val = idfromdate(new Date());
		else this.#selected_val = `1-${this.#month}-${this.#year}`;

		this.#on_day_change();
	}

	#try_cache(): CalendarResponse | undefined {
		const cache = this.#gcal_cache.get(this.selected);

		if (cache) {
			const [date, data] = cache;
			if (date.getDate() == new Date().getDate()) return data;
		}
	}

	#update_gcal() {
		this.#gcal_val = undefined;
		this.notify('gcal');

		const cache = this.#try_cache();

		if (cache) {
			this.#gcal_val = cache;
			this.notify('gcal');
			return;
		}

		const date = makedate(this.selected);
		const command = `nu -c 'cd ${App.configDir}; echo "${date.toISOString()}" | bun run --silent gcal'`;
		const selected_clone = this.selected;

		Utils.execAsync(command)
			.then(JSON.parse)
			.then((data: CalendarResponse) => {
				if (selected_clone != this.selected) return;
				this.#gcal_val = data;
				this.notify('gcal');
			})
			.catch((error) => {
				console.error(error);
			});
	}

	#on_day_change() {
		this.notify('selected');
		this.notify('data');
		this.#update_gcal();
	}

	#on_month_change() {
		this.#reselect();
		this.notify('header');
		this.notify('data');
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

	datereset() {
		this.#month = new Date().getMonth();
		this.#year = new Date().getFullYear();

		this.#on_month_change();
	}

	select(day: string) {
		if (day == today_id() && this.#selected_val == today_id()) return;
		else if (day == this.#selected_val) {
			this.#reselect();
			return;
		} else this.#selected_val = day;

		this.#on_day_change();
	}

	force_refresh() {
		this.#gcal_cache.clear();
		this.#update_gcal();
	}
}

export const CalService = new CalendarService();
