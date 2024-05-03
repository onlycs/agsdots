import AppIcon from '@services/appicon';

const Notifications = await Service.import('notifications');

const Header = () => Widget.Box({
	class_name: 'Header',
	children: [
		Widget.Icon({
			icon: AppIcon('org.gnome.Settings'),
			class_name: 'NotificationAppIcon',
			css: '-gtk-icon-style: symbolic',
			size: 16,
		}),
		Widget.Label({
			label: 'Notification UI Test',
			class_name: 'NotificationAppName',
		}),
		Widget.Label({
			label: 'Just now',
			class_name: 'NotificationTimestamp',
		}),
	]
});

const TitleBody = () => Widget.Box({
	vertical: true,
	spacing: 2,
	children: [
		Widget.Label({
			label: 'Excepteur non fugiat mollit',
			class_name: 'NotificationTitle',
			xalign: 0,
		}),
		Widget.Label({
			label: 'Enim incididunt deserunt cupidatat labore pariatur.',
			class_name: 'NotificationBody',
			xalign: 0,
		})
	]
});


export default () => Widget.Box({
	class_name: 'Notification',
	vertical: true,
	spacing: 8,
	children: [
		Header(),
		TitleBody(),
	]
});