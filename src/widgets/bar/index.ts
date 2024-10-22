import Window from '@bar/activewindow';
import Workspace from '@bar/activeworkspace';
import DateTime from '@bar/datetime';

export default Widget.Window({
	monitor: 0,
	name: 'bar',
	anchor: ['top', 'left', 'right'],
	exclusivity: 'exclusive',
	class_name: 'Bar',
	hexpand: true,
	child: Widget.CenterBox({
		start_widget: Widget.Box({
			children: [
				Window,
				Workspace,
			],
			spacing: 8,
		}),
		center_widget: DateTime,
		class_name: 'Bar',
	}),
	height_request: 28,
});
