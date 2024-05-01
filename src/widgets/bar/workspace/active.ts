import { type Binding } from 'types/service';
import { type ActiveID } from 'types/service/hyprland';

const Hyprland = await Service.import('hyprland');

const WidthDot = 6;
const WidthSpace = 6;
const MaxWidth = (WidthDot * 9) + (WidthSpace * 8);

function TransformBefore(id: number): string {
	const Spacing = (WidthDot * id) + (WidthSpace * (id-1));

	switch (id) {
		case 0: return 'background-color: transparent';
		default: return `min-width: ${Spacing}px;`;
	}
}

function TransformCurrent(id: number): string {
	const EndMargin = ({
		0: 'margin-left: 0',
		9: 'margin-right: 0',
	})[id] || '';

	return `min-width: 6px; ${EndMargin}`;
}

function TransformAfter(id: number): string {
	const Spacing = MaxWidth - (id * (WidthDot + WidthSpace));

	switch (id) {
		case 9: return 'background-color: transparent';
		default: return `min-width: ${Spacing}px;`;
	}
}

const SliderBox = (active: Binding<ActiveID, 'id', number>) => {
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

export default SliderBox(Hyprland.active.workspace.bind('id'));