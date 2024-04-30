import Window from '@bar/window';
import Workspace from '@bar/workspace';
import DateTime from '@bar/datetime';

const Bar = (monitor: number) => Widget.Window({
	monitor,
	name: 'bar',
	anchor: ['top', 'left', 'right'],
	exclusivity: 'exclusive',
	class_name: 'Bar',
	child: Widget.CenterBox({
		start_widget: Widget.Box({
			children: [Window, Workspace],
			spacing: 8,
		}),
		center_widget: Widget.Box({
			children: [DateTime],
			spacing: 8,
		}),
		end_widget: Widget.Box({}),
		class_name: 'Bar',
	}),
	height_request: 28,
});

export default Bar;