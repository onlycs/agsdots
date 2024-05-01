import { Hoverable } from '@prelude';
import { Moment } from '@variables';
import OpenMenu from '@services/openmenu';

export default Hoverable(Widget.Box({
	children: [
		Widget.Label({
			label: Moment.Date.bind(),
			class_name: 'TextMain TextLarge DateTime',
		}),
		Widget.Label({
			label: ' — ',
			class_name: 'TextMain TextLarge DateTime',
		}),
		Widget.Label({
			label: Moment.Time.bind(),
			class_name: 'TextMain TextLarge DateTime',
		}),
	],
	class_name: 'BarElement ExtraPadding',
}), {
	on_primary_click_release: () => OpenMenu.toggle('barmenu'),
});