import AppIcon from '@services/appicon';
import ImageFromUrl from '@services/image';
import Button from '@components/button';
import GLib from 'gi://GLib';

import { Notification } from 'resource:///com/github/Aylur/ags/service/notifications.js';
import { Box } from 'resource:///com/github/Aylur/ags/widgets/box.js';

const Notifications = await Service.import('notifications');

const RelTime = (utime: number) => {
	const time = GLib.DateTime.new_from_unix_local(utime);
	const now = GLib.DateTime.new_now_local();
	const diffus = now.difference(time);
	const diff = diffus / 1000000;

	const DiffTimes: [number, (d: number) => string][] = [
		[60, (_) => 'Just now'],
		[3600, (d) => `${Math.floor(d / 60)}m ago`],
		[86400, (d) => `${Math.floor(d / 3600)}h ago`],
		[-1, (d) => `${Math.floor(d / 86400)}d ago`],
	];

	for (const [limit, fmt] of DiffTimes)
		if (diff < limit || limit == -1) return fmt(diff);
};

const Header = (n: Notification) => Widget.Box({
	class_name: 'NotificationHeader',
	children: [
		Widget.Icon({
			icon: AppIcon(n.app_icon),
			class_name: 'NotificationAppIcon',
			css: '-gtk-icon-style: symbolic',
			size: 16,
		}),
		Widget.Label({
			label: n.app_name,
			class_name: 'NotificationAppName',
		}),
		Widget.Label({
			label: RelTime(n.time),
			class_name: 'NotificationTimestamp',
		}),
	]
});

const Content = (n: Notification) => {
	const textchildren = [
		Widget.Label({
			label: n.summary,
			class_name: 'NotificationTitle',
			truncate: 'end',
			hpack: 'start',
		}),
	];

	if (n.body.trim() != '') textchildren.push(
		Widget.Label({
			label: n.body.trim(),
			class_name: 'NotificationBody',
			wrap: true,
			hpack: 'start',
			justification: 'fill',
		})
	);

	const children: any[] = [
		Widget.Box({
			class_name: 'NotificationText',
			vertical: true,
			spacing: 2,
			children: textchildren,
		}),
	];

	if (n.image) children.unshift(Widget.Icon({
		class_name: 'NotificationIcon',
		icon: ImageFromUrl(n.image),
		size: 64,
		vpack: 'start'
	}));

	return Widget.Box({
		class_name: 'NotificationContent',
		children,
	});
};

const Actions = (n: Notification) => Widget.Box({
	class_name: 'NotificationActions',
	children: n.actions.map(a => Button({
		label: a.label,
		class_name: 'NotificationAction',
		hexpand: true,
		on_primary_click_release: () => Notifications.InvokeAction(n.id, a.id),
	}))
});

export const RemoveNotification = (w: Box<Box<any, unknown>, unknown>) => {
	
};

const NotificationWidget = (n: Notification) => Widget.Box({
	name: `Notification-${n.id}`,
	class_name: 'Notification',
	vertical: true,
	spacing: 12,
	hexpand: false,
	children: [
		Header(n),
		Content(n),
		...(
			n.actions.length > 0 
				? [Actions(n)] 
				: []
		)
	],
});

export default Widget.Box({
	class_name: 'NotificationsBox',
	vertical: true,
	children: [] as any[],
	spacing: 16,
	setup: self => {
		self.hook(Notifications, (self) => {
			self.children = Notifications.notifications.map(NotificationWidget);
		}, 'notify');
	}
});
