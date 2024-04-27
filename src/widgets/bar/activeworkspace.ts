import {type Binding} from 'types/service';
import {type ActiveID} from 'types/service/hyprland';
import {Hoverable} from '@prelude';

const Hyprland = await Service.import('hyprland');

const UpTo = (width: number) => Widget.Box({
	width_request: width * 6,
	height_request: 4,
	class_name: 'WidthBox',
});

const Current = (noml: boolean = false, nomr: boolean = false) => Widget.Box({
	width_request: 18,
	height_request: 4,
	class_name: `WidthBox Current ${noml ? 'NoMarginLeft' : ''} ${nomr ? 'NoMarginRight' : ''}`,
});

const After = (width: number) => Widget.Box({
	width_request: width * 6,
	height_request: 4,
	class_name: 'WidthBox',
});

const WidthBoxes = (active: Binding<ActiveID, 'id', number>) => {
	active = active.transform(id => (id - 1) % 10);

	return Widget.Box({
		children: active.transform(id => {
			switch (id) {
				case 0:
					return [Current(true), After(9 - id)];
				case 9:
					return [UpTo(id), Current(false, true)];
				default:
					return [UpTo(id), Current(), After(9 - id)];
			}
		}),
		class_name: 'WidthBoxes',
	});
};

export default Hoverable(Widget.Box({
	vertical: false,
	children: [WidthBoxes(Hyprland.active.workspace.bind('id'))],
	class_name: 'BarElement ExtraPadding ActiveWorkspace',
}));