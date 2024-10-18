import type Gdk from 'gi://Gdk?version=3.0';

import { Binding } from 'resource:///com/github/Aylur/ags/service.js';
import type { AgsWidget } from 'resource:///com/github/Aylur/ags/widgets/widget.js';

export const AddHoverClass = (self: AgsWidget<unknown>) => self.class_name += ' Hover';
export const RemoveHoverClass = (self: AgsWidget<unknown>) => self.class_name = self.class_name.replaceAll('Hover', '');
export const AddClickClass = (self: AgsWidget<unknown>) => self.class_name += ' Click';
export const RemoveClickClass = (self: AgsWidget<unknown>) => self.class_name = self.class_name.replaceAll('Click', '');

export type EventHandler<Self> = (self: Self, event: Gdk.Event) => unknown;

export function JoinHandlers<T>(a?: EventHandler<T>, b?: EventHandler<T> | Binding<any, any, EventHandler<T>>): EventHandler<T> | Binding<any, any, EventHandler<T>> {
	if (b instanceof Binding) return b.transform(f => JoinHandlers(a, f) as EventHandler<T>);
	else return (e, args) => {
		a?.(e, args);
		b?.(e, args);
	};
}
