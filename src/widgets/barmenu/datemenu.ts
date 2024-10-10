import Button from '@components/button';
import Interactable from '@components/interactable';
import { CalendarWeek, CalService } from '@services/calendar';
import { Moment } from '@variables';

const Date = () => {
	const DayLabel = Widget.Label({
		label: Moment.Dotw.bind(),
		class_name: 'Dotw',
		xalign: 0,
	});

	const DateLabel = Widget.Label({
		label: Moment.FullDate.bind(),
		class_name: 'FullDate',
		xalign: 0,
	})

	return Widget.Box({
		class_name: 'Date',
		vertical: true,
		children: [
			DayLabel,
			DateLabel,
		]
	});
};

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
				on_primary_click_release: () => CalService.previous(),
			}),
		]
	}),

	center_widget: Button({
		label: CalService.bind('header'),
		class_name: 'LabelButton',
		on_primary_click_release: () => CalService.datereset(),
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
				on_primary_click_release: () => CalService.next(),
			}),
		]
	}),
});

const WeekLabels = () => Widget.Box({
	class_name: 'WeekLabels',
	spacing: 18,
	halign: 3,
	children: ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label) => Widget.Label({
		label,
		class_name: 'WeekLabel',
	})),
});

const ZeroPadded = (day: number) => day.toString().padStart(2, '0');

const CalendarWeek = (week: CalendarWeek) => Widget.Box({
	class_name: 'Week',
	halign: 3,
	children: week.days.map((day) => Button({
		label: ZeroPadded(day.date),
		class_name: `Day ${day.today ? 'Today' : ''} ${day.in_month ? '' : 'Gray'} ${day.selected ? 'Selected' : ''}`,
		halign: 3,
		on_primary_click_release: () => CalService.toggleSelected(day.id),
	})),
});

const Calendar = () => Widget.Box({
	vertical: true,
	class_name: 'Weeks',
	children: CalService.bind('data').transform((weeks) => [WeekLabels(), ...weeks.map(CalendarWeek)]),
});

export default Widget.Box({
	class_name: 'DateMenu',
	vertical: true,
	children: [
		Date(),
		Widget.Box({
			class_name: 'Calendar',
			hexpand: true,
			vertical: true,
			children: [
				Header(),
				Calendar(),
			],
		}),
	],
});