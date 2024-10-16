import AppIcon from '@services/appicon';
import ImageFromUrl from '@services/image';
import Button from '@components/button';
import GLib from 'gi://GLib';

import type { Notification } from 'resource:///com/github/Aylur/ags/service/notifications.js';
import DNDManager from '@services/dnd';

const NotifyService = await Service.import('notifications');

const has_notifications = () => NotifyService.notifications.length > 0;

const RelTime = (utime: number) => {
	const time = GLib.DateTime.new_from_unix_local(utime);
	const now = GLib.DateTime.new_now_local();
	const diffus = now.difference(time);
	const diff = diffus / 1000000;

	const DiffTimes: Array<[number, (d: number) => string]> = [
		[60, _ => 'Just now'],
		[3600, d => `${Math.floor(d / 60)}m ago`],
		[86400, d => `${Math.floor(d / 3600)}h ago`],
		[-1, d => `${Math.floor(d / 86400)}d ago`],
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
	],
});

const Actions = (n: Notification) => Widget.Box({
	class_name: 'Actions',
	children: n.actions.map(a => Button({
		label: a.label,
		class_name: 'Action',
		hexpand: false,
		on_primary_click_release: () => { NotifyService.InvokeAction(n.id, a.id); },
	})),
});

const Close = (n: Notification) => Widget.Button({
	image: Widget.Icon({
		icon: 'window-close-symbolic',
		size: 16,
	}),
	class_name: 'Close',
	on_primary_click_release: () => { NotifyService.CloseNotification(n.id); },
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
		}),
	);

	const children: any[] = [
		Widget.Box({
			class_name: 'TextBox',
			vertical: true,
			spacing: 4,
			children: textchildren,
		}),
	];

	if (n.image) children.unshift(Widget.Icon({
		class_name: 'Image',
		icon: ImageFromUrl(n.image),
		size: 64,
		vpack: 'start',
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
	spacing: 8,
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
		),
	],
});

const NotificationFallback = () => Widget.Box({
	halign: 3,
	valign: 3,
	vexpand: true,
	vertical: true,
	spacing: 24,
	class_name: 'Fallback',
	children: [
		Widget.Icon({
			icon: 'preferences-system-notifications-symbolic',
			size: 96,
			class_name: 'Icon',
		}),
		Widget.Label({
			label: 'No Notifications',
			class_name: 'Label',
		}),
	],
});

const NotificationList = (notifs: Notification[]) => Widget.Scrollable({
	hscroll: 'never',
	vexpand: true,
	class_name: 'Scrollbox',
	vscrollbar_policy: 1,
	child: Widget.Box({
		class_name: 'Notifications',
		vertical: true,
		vexpand: true,
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
				label: 'Do Not Disturb',
				class_name: 'DNDLabel',
			}),
			Widget.Switch({
				class_name: 'Switch',
				on_activate: DNDManager.switch,
			}),
		],
	}),
	end_widget: Widget.Box({
		halign: 2,
		children: [
			Button({
				class_name: 'Button',
				label: 'Clear',
				on_primary_click_release: () => { NotifyService.Clear(); },
				setup: self => self.hook(NotifyService, self => self.visible = has_notifications(), 'notify'),
			}),
		],
	}),
});

export default Widget.Box({
	class_name: 'NotificationsBox',
	vertical: true,
	children: [
		Widget.Box({
			children: [] as any[],
			halign: 3,
			setup: (self) => {
				self.hook(NotifyService, (self) => {
					if (NotifyService.notifications.length == 0) {
						self.children = [NotificationFallback()];
					} else {
						self.children = [NotificationList(NotifyService.notifications)];
					}
				}, 'notify');
			},
		}),
		Footer(),
	],
});
