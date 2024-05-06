import EventBox from 'resource:///com/github/Aylur/ags/widgets/eventbox.js';

import { type Widget } from 'types/widgets/widget';
import { type EventBoxProps } from 'types/widgets/eventbox';
import { type EventHandler, AddClickClass, AddHoverClass, RemoveClickClass, RemoveHoverClass, JoinHandlers } from '@prelude';

export default function Interactable<Child extends Widget<Attr>, Attr = unknown>(props: EventBoxProps<Child, Attr>): EventBox<Child, Attr> {
	const _hover: EventHandler<EventBox<Child, Attr>> = self => AddHoverClass(self.child);
	const _unhover: EventHandler<EventBox<Child, Attr>> = self => RemoveHoverClass(self.child);
	const _click: EventHandler<EventBox<Child, Attr>> = self => AddClickClass(self.child);
	const _unclick: EventHandler<EventBox<Child, Attr>> = self => RemoveClickClass(self.child); 
	const _setup = (self: EventBox<Child, Attr>) => self.on('leave-notify-event', _unhover);

	return Widget.EventBox({
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