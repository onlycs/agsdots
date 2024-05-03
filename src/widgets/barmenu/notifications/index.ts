import Notification from '@barmenu/notifications/notification';

export default Widget.Box({
	class_name: 'NotificationsBox',
	vertical: true,
	children: [Notification()],
	spacing: 16,
});