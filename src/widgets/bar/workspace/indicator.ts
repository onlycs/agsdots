import Gtk from 'types/@girs/gtk-3.0/gtk-3.0';
import Box from 'types/widgets/box';

const Hyprland = await Service.import('hyprland');
const Mask = Variable(0);

async function UpdateMask() {
	const json = await Hyprland.messageAsync('j/workspaces').catch(() => null);
	if (!json) return;

	const workspaces = JSON.parse(json) as typeof Hyprland.workspaces;
	let mask = 0;

	for (const wksp of workspaces) {
		if (wksp.windows == 0) continue;

		const id = wksp.id - 1;
		mask |= 1 << id % 10;
	}

	Mask.setValue(mask);
}

function MakeClassName(mask: number, i: number) {
	let classname = 'WorkspaceIndicator';

	if (i == 9) classname += ' Last';
	if (mask & 1<<i) classname += ' Windows';

	return classname;
}

function Boxes() {
	const widgets: Box<Gtk.Widget, unknown>[] = [];

	for (const i of Array(10).keys()) {
		widgets.push(Widget.Box({ 
			class_name: Mask.bind('value').transform(v => MakeClassName(v, i))
		}));
	}

	return widgets;
}

export default Widget.Box({
	children: Boxes(),
	setup: self => self
		.hook(Hyprland, UpdateMask, 'notify::workspaces')
		.hook(Hyprland, UpdateMask, 'notify::clients'),
});