const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Month = Variable(parseInt(Utils.exec('date +%m')) - 1);
const Year = Variable(parseInt(Utils.exec('date +%Y')));

export interface CalendarDay {
	date: number;
	today: boolean;
	in_month: boolean;
}

export interface CalendarWeek {
	days: CalendarDay[];
	woty: number;
}

function first_day(month: number, year: number) {
	return new Date(year, month, 1).getDay();
}

function last_day(month: number, year: number) {
	return new Date(year, month, days_in(month, year)).getDay();
}

function days_in(month: number, year: number) {
	if (month == 11) month = 0, year++;
	else month++;

	return new Date(year, month, 0).getDate();
}

function last_end(month: number, year: number): CalendarDay[] {
	const day = first_day(month, year);
	const num_days = day == 0 ? 7 : day;
	const prev_month_days = month == 0 ? days_in(11, year - 1) : days_in(month - 1, year);
	const begin_day = prev_month_days - num_days + 1;

	const days = [] as CalendarDay[];

	for (let i = 0; i < num_days; i++) {
		days.push({
			date: begin_day + i,
			today: false,
			in_month: false,
		});
	}

	return days;
}

function all_days(month: number, year: number): CalendarDay[] {
	const first = first_day(month, year);
	const days = last_end(month, year);
	const num_days = days_in(month, year);

	for (let i = 1; i <= num_days; i++) {
		days.push({
			date: i,
			today: i == new Date().getDate() && month == new Date().getMonth() && year == new Date().getFullYear(),
			in_month: true,
		});
	}

	const next_days = (6 * 7) - days.length;

	for (let i = 1; i <= next_days; i++) {
		days.push({
			date: i,
			today: false,
			in_month: false,
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

function group_weeks(month: number, year: number): CalendarWeek[] {
	const days = all_days(month, year);
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

function generateCalendarMonth(month: number, year: number): CalendarWeek[] {
	return group_weeks(month, year);
}

export const CalService = {
	bindings: {
		monthText: () => Month.bind().transform((month) => Months[month]),
		monthNum: () => Month.bind(),
		monthYearText: () => Month.bind().transform((month) => {
			if (Year.getValue() != new Date().getFullYear()) return `${Months[month]} ${Year.value}`;
			else return Months[month];
		}),
		year: () => Year.bind(),
		month_obj: () => Month.bind().transform((month) => generateCalendarMonth(month, Year.getValue())),
	},
	previous: () => {
		const month = Month.getValue();

		if (month == 0) {
			Year.setValue(Year.getValue() - 1);
			Month.setValue(11);
			return;
		}

		Month.setValue(month - 1);
	},
	next: () => {
		const month = Month.getValue();

		if (month == 11) {
			Year.setValue(Year.getValue() + 1);
			Month.setValue(0);
			return;
		}

		Month.setValue(month + 1);
	},
};