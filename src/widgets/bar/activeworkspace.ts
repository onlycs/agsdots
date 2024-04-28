import { type Binding } from 'types/service';
import { type ActiveID } from 'types/service/hyprland';
import { Hoverable } from '@prelude';

const Hyprland = await Service.import('hyprland');

function TransformUpTo(id: number): string {
	switch (id) {
		case 0: return 'background-color: transparent';
		case 9: return 'min-width: 64px;';
		default: return `min-width: ${id * 6}px;`;
	}
}

function TransformCurrent(id: number): string {
	const mixin = ({
		0: 'margin-left: 0',
		9: 'margin-right: 0',
	})[id] || '';

	return `min-width: 6px; ${mixin}`;
}

function TransformAfter(id: number): string {
	switch (id) {
		case 9: return 'background-color: transparent';
		case 0: return 'min-width: 64px;';
		default: return `min-width: ${56 - id * 6}px;`;
	}
}

const WidthBoxes = (active: Binding<ActiveID, 'id', number>) => {
	active = active.transform(id => (id - 1) % 10);

	return Widget.Box({
		children: [
			Widget.Box({
				height_request: 4,
				class_name: 'WidthBox',
				css: active.transform(TransformUpTo),
			}),
			Widget.Box({
				height_request: 4,
				class_name: 'WidthBox Current',
				css: active.transform(TransformCurrent),
			}),
			Widget.Box({
				height_request: 4,
				class_name: 'WidthBox',
				css: active.transform(TransformAfter),
			}),
		],
		class_name: 'WidthBoxes',
	});
};

export default Hoverable(Widget.Box({
	vertical: false,
	children: [WidthBoxes(Hyprland.active.workspace.bind('id'))],
	class_name: 'BarElement ExtraPadding ActiveWorkspace',
}));