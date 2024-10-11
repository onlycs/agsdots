import AgsButton from 'resource:///com/github/Aylur/ags/widgets/button.js';
import Gtk from 'gi://Gtk?version=3.0';

import { type ButtonProps } from 'types/widgets/button';

import { AddClickClass, AddHoverClass, RemoveClickClass, RemoveHoverClass, type EventHandler, JoinHandlers } from '@prelude';


export default function Button<Child extends Gtk.Widget, Attr = unknown>(props: ButtonProps<Child, Attr>): AgsButton<Child, Attr> {
	const _hover: EventHandler<AgsButton<Child, Attr>> = self => AddHoverClass(self as any);
	const _unhover: EventHandler<AgsButton<Child, Attr>> = self => RemoveHoverClass(self as any);
	const _click: EventHandler<AgsButton<Child, Attr>> = self => AddClickClass(self as any);
	const _unclick: EventHandler<AgsButton<Child, Attr>> = self => RemoveClickClass(self as any);
	const _setup = (self: AgsButton<Child, Attr>) => self.on('leave-notify-event', _unhover);

	return Widget.Button({
		...props,
		on_hover: JoinHandlers(_hover, props.on_hover),
		on_hover_lost: JoinHandlers(_unhover, props.on_hover_lost),
		on_primary_click: JoinHandlers(_click, props.on_primary_click),
		on_primary_click_release: JoinHandlers(_unclick, props.on_primary_click_release),
		setup: self => {
			_setup(self);
			props.setup?.(self);
		},
	});
}