import Button from '@components/button';
import Interactable from '@components/interactable';
import type { Option } from '@result';
import { type CalendarResponse, type CalendarWeek, CalendarService, filter_id } from '@services/calendar';

const Header = () => Widget.CenterBox({
	class_name: 'Header',
	start_widget: Widget.Box({
		children: [
			Button({
				class_name: 'Button Left',
				image: Widget.Icon({
					icon: 'pan-start-symbolic',
					size: 16,
				}),
				on_primary_click_release: () => { CalendarService.previous(); },
			}),
		],
	}),

	center_widget: Button({
		label: CalendarService.bindkey('header'),
		class_name: 'LabelButton',
		on_primary_click_release: () => { CalendarService.reset(); },
	}),

	end_widget: Widget.Box({
		halign: 2,
		children: [
			Button({
				class_name: 'Button Right',
				image: Widget.Icon({
					icon: 'pan-end-symbolic',
					size: 16,
				}),
				on_primary_click_release: () => { CalendarService.next(); },
			}),
		],
	}),
});

const WeekLabels = () => Widget.Box({
	class_name: 'WeekLabels',
	spacing: 17,
	halign: 3,
	children: ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(label => Widget.Label({
		label,
		class_name: 'WeekLabel',
	})),
});

const ZeroPadded = (day: number) => day.toString().padStart(2, '0');

const Week = (week: CalendarWeek, gcal: Option<CalendarResponse>) => Widget.Box({
	class_name: 'Week',
	halign: 3,
	children: week.days.map(day => Interactable({
		halign: 3,
		on_primary_click_release: () => { CalendarService.select(day.id); },
		child: Widget.Box({
			vertical: true,
			class_name: `Day ${day.today ? 'Today' : ''} ${day.in_month ? '' : 'Gray'} ${day.selected ? 'Selected' : ''}`,
			halign: 3,
			children: [
				Widget.Label({
					label: ZeroPadded(day.date),
					class_name: 'Label',
				}),
				Widget.Label({
					label: '•'.repeat(Math.min(Object.values(gcal.map(c => c.events).unwrap_or({})).flatMap(n => n.items ?? []).filter(filter_id(day.id)).length, 3)),
					class_name: 'Bullet',
				}),
			],
		}),
	})),
});

const Calendar = () => Widget.Box({
	vertical: true,
	class_name: 'Weeks',
	children: CalendarService.bindkeys('weeks', 'gcal').transform(data => [WeekLabels(), ...data.weeks.map(week => Week(week, data.gcal.into_option().flatten<CalendarResponse>()))]),
});

export default () => Widget.Box({
	class_name: 'Calendar',
	hexpand: true,
	vertical: true,
	children: [
		Header(),
		Calendar(),
	],
});
