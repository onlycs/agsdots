import AppIcon from '@services/appicon';
import ImageFromUrl from '@services/image';
import Button from '@components/button';
import GLib from 'gi://GLib';

import { Notification } from 'resource:///com/github/Aylur/ags/service/notifications.js';

const NotifyService = await Service.import('notifications');

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
	class_name: 'Header',
	children: [
		Widget.Icon({
			icon: AppIcon(n.app_icon),
			class_name: 'AppIcon',
			css: '-gtk-icon-style: symbolic',
			size: 16,
		}),
		Widget.Label({
			label: n.app_name,
			class_name: 'AppName',
		}),
		Widget.Label({
			label: RelTime(n.time),
			class_name: 'Timestamp',
		}),
	]
});

const Actions = (n: Notification) => Widget.Box({
	class_name: 'Actions',
	children: n.actions.map(a => Button({
		label: a.label,
		class_name: 'Action',
		hexpand: false,
		on_primary_click_release: () => NotifyService.InvokeAction(n.id, a.id),
	}))
});

const Close = (n: Notification) => Widget.Button({
	image: Widget.Icon({
		icon: 'window-close-symbolic',
		size: 16,
	}),
	class_name: 'Close',
	on_primary_click_release: () => NotifyService.CloseNotification(n.id),
});

const Content = (n: Notification) => {
	const textchildren = [
		Widget.Label({
			label: n.summary,
			class_name: 'Title',
			truncate: 'end',
			hpack: 'start',
		}),
	];

	if (n.body.trim() != '') textchildren.push(
		Widget.Label({
			label: n.body.trim(),
			class_name: 'Body',
			wrap: true,
			hpack: 'start',
			justification: 'fill',
		})
	);

	const children: any[] = [
		Widget.Box({
			class_name: 'TextBox',
			vertical: true,
			spacing: 2,
			children: textchildren,
		}),
	];

	if (n.image) children.unshift(Widget.Icon({
		class_name: 'Image',
		icon: ImageFromUrl(n.image),
		size: 64,
		vpack: 'start'
	}));

	return Widget.Box({
		class_name: 'Content',
		children,
	});
};

const NotificationWidget = (n: Notification) => Widget.Box({
	name: `Notification-${n.id}`,
	class_name: 'Notification',
	vertical: true,
	spacing: 12,
	hexpand: false,
	children: [
		Widget.CenterBox({
			start_widget: Widget.Box({
				children: [Header(n)],
				halign: 1,
			}),
			end_widget: Widget.Box({
				halign: 2,
				children: [Close(n)],
			}),
		}),
		Content(n),
		...(
			n.actions.length > 0
				? [Actions(n)]
				: []
		)
	],
});

const NotificationFallback = () => Widget.Label({
	label: 'No notifications',
	class_name: 'NoNotifications',
	vexpand: true,
});

const NotificationList = (notifs: Notification[]) => Widget.Scrollable({
	hscroll: 'never',
	vexpand: true,
	class_name: 'Scrollbox',
	child: Widget.Box({
		class_name: 'Notifications',
		vertical: true,
		children: notifs.map(NotificationWidget),
		spacing: 16,
	}),
});

const Footer = () => Widget.CenterBox({
	class_name: 'Footer',
	halign: 0,
	start_widget: Widget.Box({
		halign: 1,
		children: [
			Widget.Label({
				label: 'laborum consequat',
				class_name: 'DNDLabel',
			})
		]
	}),
	end_widget: Widget.Box({
		halign: 2,
		children: [
			Button({
				class_name: 'Button',
				label: 'Clear',
				on_primary_click_release: () => NotifyService.Clear(),
			})
		]
	}),
});

export default Widget.Box({
	class_name: 'NotificationsBox',
	vertical: true,
	children: [
		Widget.Box({
			children: [] as any[],
			halign: 3,
			setup: self => {
				self.hook(NotifyService, (self) => {
					if (NotifyService.notifications.length == 0) {
						self.children = [NotificationFallback()];
					} else {
						self.children = [NotificationList(NotifyService.notifications)];
					}
				}, 'notify');
			}
		}),
		Footer(),
	]
});
