import { Moment } from '@variables';
import MenuVis from '@services/menuvis';
import Interactable from '@components/interactable';

export default Interactable({
	child: Widget.Box({
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
		class_name: 'BarElement DateTimeBox',
	}),
	on_primary_click_release: () => MenuVis.set('barmenu'),
});