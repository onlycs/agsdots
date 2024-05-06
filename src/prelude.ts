import { type Widget } from 'types/widgets/widget';
import Gdk from 'gi://Gdk';

export const AddHoverClass = (self: Widget<unknown>) => self.class_name += ' Hover';
export const RemoveHoverClass = (self: Widget<unknown>) => self.class_name = self.class_name.replaceAll('Hover', '');
export const AddClickClass = (self: Widget<unknown>) => self.class_name += ' Click';
export const RemoveClickClass = (self: Widget<unknown>) => self.class_name = self.class_name.replaceAll('Click', '');

export type EventHandler<Self> = (self: Self, event: Gdk.Event) => boolean | unknown;

export function JoinHandlers<T>(a?: EventHandler<T>, b?: EventHandler<T>): EventHandler<T> {
	return (o, args) => {
		a?.(o, args);
		b?.(o, args);
	};
}