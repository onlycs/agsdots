import type EventBox from 'types/widgets/eventbox';
import { type Box } from 'types/widgets/box';
import type Gtk from 'types/@girs/gtk-3.0/gtk-3.0';

export function Hoverable<Child extends Gtk.Widget, Attr>(target: Box<Child, Attr>, cssclass = 'Hover') {
	return Widget.EventBox({
		child: target,
		on_hover: (self: EventBox<Box<Child, Attr>, Attr>) => {
			self.child.class_name += ` ${cssclass}`;
		},
		on_hover_lost: (self: EventBox<Box<Child, Attr>, Attr>) => {
			self.child.class_name = self.child.class_name.replaceAll(` ${cssclass}`, '');
		},
		setup: self => self.on('leave-notify-event', self.on_hover_lost),
	});
}