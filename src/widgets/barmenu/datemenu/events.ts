import { CalService, makedate, Months } from "@services/calendar";

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

export default () => Widget.Box({
	class_name: 'EventsBox',
	vertical: true,
	children: [
		DayText(),
	]
});