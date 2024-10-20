import Interactable from '@components/interactable';
import { CalService, id_to_date, Months, type CalendarResponse } from '@services/calendar';
import MenuVis from '@services/menuvis';
import type { calendar_v3 } from 'googleapis';
import { Align } from 'types/@girs/gtk-3.0/gtk-3.0.cjs';
import { EllipsizeMode } from 'types/@girs/pango-1.0/pango-1.0.cjs';

const CalculateDayText = (id: string) => {
	const today = new Date();
	const date = id_to_date(id);

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

	return events.sort((a, b) => {
		const starta = a.start?.dateTime;
		const startb = b.start?.dateTime;

		// undefined == 12am
		if (!starta) return -1;
		if (!startb) return 1;

		return Date.parse(starta) - Date.parse(startb);
	}).map((ev) => {
		const get_fulltext = () => {
			const today = id_to_date(CalService.selected);

			const startstr = ev.start?.dateTime;
			const endstr = ev.end?.dateTime;

			if (!startstr || !endstr) return 'All Day';

			const start = new Date(Date.parse(startstr));
			const end = new Date(Date.parse(endstr));
			const startday = new Date(start.getFullYear(), start.getMonth(), start.getDate());
			const endday = new Date(end.getFullYear(), end.getMonth(), end.getDate());

			const timeof = (date: Date) => {
				const hours = date.getHours(); // 0-24
				const aphours = (hours + 11) % 12 + 1;
				const ap = hours >= 12 ? 'pm' : 'am';
				const minutes = date.getMinutes().toString().padStart(2, '0');

				if (minutes == '00') return `${aphours}${ap}`;
				else return `${aphours}:${minutes}${ap}`;
			};

			const num_days = (endday.getTime() - startday.getTime()) / (24 * 60 * 60 * 1000) + 1;
			const cur_day = (today.getTime() - startday.getTime()) / (24 * 60 * 60 * 1000) + 1;

			const textstart = timeof(start);
			const textend = timeof(end);
			let fulltext = `${textstart} - ${textend}`;

			if (startday.getTime() == endday.getTime()) {
				if ((start.getHours() >= 12) == (end.getHours() >= 12)) {
					const stripped = textstart.substring(0, textstart.length - 2);
					fulltext = `${stripped} - ${textend}`;
				}
			} else if (startday.getTime() != today.getTime() && endday.getTime() != today.getTime()) {
				fulltext = 'All Day';
				ev.summary! += ` (Day ${cur_day}/${num_days})`;
			} else if (startday.getTime() == today.getTime()) {
				fulltext = textstart;
				ev.summary! += ` (Day ${cur_day}/${num_days})`;
			} else {
				fulltext = `Until ${textend}`;
				ev.summary! += ` (Day ${cur_day}/${num_days})`;
			}

			return fulltext;
		};

		const fulltext = get_fulltext();

		return Widget.Box({
			class_name: 'Event',
			vertical: false,
			children: [
				Widget.Box({
					css: `background-color: ${ev.color}`,
					class_name: 'VPill',
				}),
				Widget.Box({
					vertical: true,
					children: [
						Widget.Label({
							label: fulltext.trim(),
							class_name: 'Time',
							halign: Align.START,
						}),
						Widget.Label({
							label: ev.summary,
							class_name: 'Summary',
							halign: Align.START,
							ellipsize: EllipsizeMode.END,
						}),
					],
				}),
			],
		});
	});
};

export default () => Interactable({
	child: Widget.Box({
		class_name: 'Events',
		vertical: true,
		children: CalService.bind('gcal').transform(cal => [
			DayText(),
			...(cal ? Events(cal) : [Widget.Spinner()] as any),
		]),
	}),
	on_primary_click_release: () => {
		MenuVis.closeall();

		Utils.execAsync(['gnome-calendar', '--date', id_to_date(CalService.selected).toLocaleDateString()]).catch(console.error);
	},
});
