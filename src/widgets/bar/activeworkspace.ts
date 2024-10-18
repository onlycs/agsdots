import type Gtk from 'gi://Gtk';
import type Box from 'resource:///com/github/Aylur/ags/widgets/box.js';
import Interactable from '@components/interactable';

import type { ActiveID } from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import type { Binding } from 'resource:///com/github/Aylur/ags/service.js';

const Hyprland = await Service.import('hyprland');
const IndicatorMask = Variable(0);

function UpdateIndicatorMask() {
	(async () => {
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
	})().catch(console.error);
}

const Indicator = () => {
	function MakeClassName(mask: number, i: number) {
		let classname = 'WorkspaceIndicator';

		if (i == 9) classname += ' Last';
		if (mask & 1 << i) classname += ' Windows';

		return classname;
	}

	function Boxes() {
		const widgets: Array<Box<Gtk.Widget, unknown>> = [];

		for (const i of Array(10).keys()) {
			widgets.push(Widget.Box({
				class_name: IndicatorMask.bind('value').transform(v => MakeClassName(v, i)),
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
};

const ActiveWorkspace = (workspace: Binding<ActiveID, 'id', number>) => {
	const dot = 6;
	const space = 6;

	const active = workspace.transform(id => id - 1);

	const Before = (id: number) => {
		const spacing = (id * dot) + ((id - 1) * space);

		switch (id) {
			case 0: return 'background-color: transparent';
			default: return `min-width: ${spacing}px;`;
		}
	};

	const Current = (id: number) => {
		const EndMargin = ({
			0: 'margin-left: 0',
			9: 'margin-right: 0',
		})[id] ?? '';

		return `min-width: 6px; ${EndMargin}`;
	};

	const After = (id: number) => {
		const spacing = ((9 - id) * dot) + (Math.max(0, 8 - id) * space);

		switch (id) {
			case 9: return 'background-color: transparent';
			default: return `min-width: ${spacing}px;`;
		}
	};

	return Widget.Box({
		children: [
			Widget.Box({
				class_name: 'SliderSegment',
				css: active.transform(Before),
			}),
			Widget.Box({
				class_name: 'SliderSegment Current',
				css: active.transform(Current),
			}),
			Widget.Box({
				class_name: 'SliderSegment',
				css: active.transform(After),
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
	}),
});
