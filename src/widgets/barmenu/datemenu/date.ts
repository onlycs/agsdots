import { Moment } from '@variables';

export default () => {
	const DayLabel = Widget.Label({
		label: Moment.Dotw.bind(),
		class_name: 'Dotw',
		xalign: 0,
	});

	const DateLabel = Widget.Label({
		label: Moment.FullDate.bind(),
		class_name: 'FullDate',
		xalign: 0,
	});

	return Widget.Box({
		class_name: 'Date',
		vertical: true,
		children: [
			DayLabel,
			DateLabel,
		],
	});
};
