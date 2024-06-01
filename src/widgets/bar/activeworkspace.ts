import Gtk from 'gi://Gtk';
import Box from 'resource:///com/github/Aylur/ags/widgets/box.js';
import Interactable from '@components/interactable';

import { ActiveID } from 'resource:///com/github/Aylur/ags/service/hyprland.js'; 
import { Binding } from 'resource:///com/github/Aylur/ags/service.js';

const Hyprland = await Service.import('hyprland');
const IndicatorMask = Variable(0);

async function UpdateIndicatorMask() {
	const json = await Hyprland.messageAsync('j/workspaces').catch(() => null);
	if (!json) return;

	const workspaces = JSON.parse(json) as typeof Hyprland.workspaces;
	let mask = 0;

	for (const wksp of workspaces) {
		if (wksp.windows == 0) continue;

		const id = wksp.id - 1;
		mask |= 1 << id % 10;
	}

	IndicatorMask.setValue(mask);
}

const Indicator = () => {
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
				class_name: IndicatorMask.bind('value').transform(v => MakeClassName(v, i))
			}));
		}

		return widgets;
	}

	return Widget.Box({
		children: Boxes(),
		setup: self => self
			.hook(Hyprland, UpdateIndicatorMask, 'notify::workspaces')
			.hook(Hyprland, UpdateIndicatorMask, 'notify::clients'),
	});
}

const ActiveWorkspace = (active: Binding<ActiveID, 'id', number>) => {
	const WidthDot = 6;
	const WidthSpace = 6;
	const MaxWidth = (WidthDot * 9) + (WidthSpace * 8);
	
	const TransformBefore = (id: number) => {
		const Spacing = (WidthDot * id) + (WidthSpace * (id-1));
	
		switch (id) {
			case 0: return 'background-color: transparent';
			default: return `min-width: ${Spacing}px;`;
		}
	}
	
	const TransformCurrent = (id: number) => {
		const EndMargin = ({
			0: 'margin-left: 0',
			9: 'margin-right: 0',
		})[id] || '';
	
		return `min-width: 6px; ${EndMargin}`;
	}
	
	const TransformAfter = (id: number) => {
		const Spacing = MaxWidth - (id * (WidthDot + WidthSpace));
	
		switch (id) {
			case 9: return 'background-color: transparent';
			default: return `min-width: ${Spacing}px;`;
		}
	}

	active = active.transform(id => (id - 1) % 10);

	return Widget.Box({
		children: [
			Widget.Box({
				class_name: 'SliderSegment',
				css: active.transform(TransformBefore),
			}),
			Widget.Box({
				class_name: 'SliderSegment Current',
				css: active.transform(TransformCurrent),
			}),
			Widget.Box({
				class_name: 'SliderSegment',
				css: active.transform(TransformAfter),
			}),
		],
		class_name: 'SliderBox',
	});
};

export default Interactable({ 
	child: Widget.Box({
		vertical: true,
		children: [ActiveWorkspace(Hyprland.active.workspace.bind('id')), Indicator()],
		class_name: 'BarElement WorkspaceBox',
		homogeneous: true,
	}) 
});