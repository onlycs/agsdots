import { CalService, makedate, Months, type CalendarResponse } from '@services/calendar';
import type { calendar_v3 } from 'googleapis';

const CalculateDayText = (id: string) => {
	const today = new Date();
	const date = makedate(id);

	// strip time from date
	today.setHours(0, 0, 0, 0);

	// yesterday/today/tomorrow
	if (today.toDateString() == date.toDateString()) {
		return 'Today';
	} else if (today.setDate(today.getDate() - 1) == date.getTime()) {
		return 'Yesterday';
	} else if (today.setDate(today.getDate() + 2) == date.getTime()) {
		return 'Tomorrow';
	}

	// if year is different, show full date
	if (today.getFullYear() != date.getFullYear()) {
		return `${Months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
	}

	// if month is different, show month and date
	return `${Months[date.getMonth()]} ${date.getDate()}`;
};

const DayText = () => Widget.Label({
	label: CalService.bind('selected').transform(CalculateDayText),
	class_name: 'DayText',
	xalign: 0,
});

const Events = (cal: CalendarResponse) => {
	const calendars = cal.events;
	const events: Array<calendar_v3.Schema$Event & { color: string }> = [];

	for (const color in calendars) {
		const evdata = calendars[color].items!;
		if (evdata.length == 0) continue;

		const colored = evdata.map(ev => ({ ...ev, color }));
		events.push(...colored);
	}

	return events.map(ev =>
		Widget.Label({
			label: ev.color,
			class_name: 'EventsHeader',
		}),
	);
};

export default () => Widget.Box({
	class_name: 'EventsBox',
	vertical: true,
	children: CalService.bind('gcal').transform(cal => [
		DayText(),
		...(cal ? Events(cal) : [Widget.Spinner()] as any),
	]),
});
