import { calendar_v3 } from "@googleapis/calendar";

const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

function makeidfromdate(date: Date) {
	return makeid(date.getDate(), date.getMonth(), date.getFullYear());
}

function todayId() {
	return makeidfromdate(new Date());
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

function group_weeks(month: number, year: number, selected: string): CalendarWeek[] {
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

function generateCalendarMonth(month: number, year: number, selected: string): CalendarWeek[] {
	return group_weeks(month, year, selected);
}

export interface GCalResponse {
	date: Date,
	events: calendar_v3.Schema$Event[],
	cals: calendar_v3.Schema$CalendarListEntry[],
}

class CalendarService extends Service {
	static {
		Service.register(
			this,
			{},
			{
				'selected': ['string', 'r'],
				'data': ['gobject', 'r'],
				'header': ['string', 'r'],
				'gcal': ['gobject', 'r'],
			}
		)
	}

	#month: number = 0;
	#year: number = 0;
	#selected_val: string = todayId();
	#gcal_val: GCalResponse | undefined = undefined;

	constructor() {
		super();
		this.datereset();
	}

	get selected() {
		return this.#selected_val;
	}

	get data() {
		return generateCalendarMonth(this.#month, this.#year, this.selected);
	}

	get header() {
		if (this.#year == new Date().getFullYear()) return Months[this.#month];
		else return `${Months[this.#month]}  ${this.#year}`;
	}

	get gcal() {
		return this.#gcal_val
	}

	#defaultselect() {
		if (new Date().getMonth() == this.#month) this.#selected_val = makeidfromdate(new Date());
		else this.#selected_val = `1-${this.#month}-${this.#year}`

		this.#onSelectChange();
	}

	#updateGcal() {
		this.#gcal_val = undefined;
		this.notify('gcal');

		const date = makedate(this.selected);
		const command = `nu -c 'cd ${App.configDir}; echo "${date.toISOString()}" | bun run --silent gcal'`;

		Utils.execAsync(command)
			.then(JSON.parse)
			.then((data: GCalResponse) => {
				this.#gcal_val = data;
				this.notify('gcal');
			})
			.catch((error) => {
				console.error(error);
			});
	}

	#onSelectChange() {
		this.notify('selected');
		this.notify('data');
		this.#updateGcal();
	}

	#onMonthChange() {
		this.#defaultselect();
		this.notify('header');
		this.notify('data');
	}

	previous() {
		if (this.#month == 0) this.#month = 11, this.#year--;
		else this.#month--;

		this.#onMonthChange();
	}

	next() {
		if (this.#month == 11) this.#month = 0, this.#year++;
		else this.#month++;

		this.#onMonthChange();
	}

	datereset() {
		this.#month = new Date().getMonth();
		this.#year = new Date().getFullYear();

		this.#onMonthChange();
	}

	select(day: string) {
		if (day == todayId() && this.#selected_val == todayId()) return;
		else if (day == this.#selected_val) return this.#defaultselect();
		else this.#selected_val = day;

		this.#onSelectChange();
	}
}

export const CalService = new CalendarService();