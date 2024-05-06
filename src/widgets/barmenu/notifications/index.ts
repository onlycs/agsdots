import Notification from '@barmenu/notifications/notification';

const NotificationService = await Service.import('notifications');

export default Widget.Box({
	class_name: 'NotificationsBox',
	vertical: true,
	children: [],
	spacing: 16,
	setup: self => {
		self.hook(NotificationService, (self) => {
			self.children = NotificationService.notifications.map(Notification);
		}, 'notify');
	}
});