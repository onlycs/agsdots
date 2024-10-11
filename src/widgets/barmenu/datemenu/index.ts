import Date from './date';
import Calendar from './calendar';
import Events from './events';

export default Widget.Box({
	class_name: 'DateMenu',
	vertical: true,
	children: [
		Date(),
		Calendar(),
		Events(),
	],
});