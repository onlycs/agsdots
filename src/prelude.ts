import type EventBox from 'types/widgets/eventbox';
import { type Box } from 'types/widgets/box';
import type Gtk from 'types/@girs/gtk-3.0/gtk-3.0';
import { EventBoxProps } from 'types/widgets/eventbox';

type EBox<Child extends Gtk.Widget> = EventBox<NBox<Child>, unknown>;
type NBox<Child extends Gtk.Widget> = Box<Child, unknown>;

export function Hoverable<Child extends Gtk.Widget>(target: NBox<Child>, props: EventBoxProps<Gtk.Widget> = {}) {
	return Widget.EventBox({
		...props,
		child: target,
		on_hover: (self: EBox<Child>) => {
			self.child.class_name += ' Hover';
			props.on_hover?.(self);
		},
		on_hover_lost: (self: EBox<Child>) => {
			self.child.class_name = self.child.class_name.replaceAll(' Hover', '');
			props.on_hover_lost?.(self);
		},
		setup(self) {
			self.on('leave-notify-event', self.on_hover_lost);
			props.setup?.(self);
		},
	});
}