import ActiveWindow from '@widgets/bar/activewindow';
import ActiveWorkspace from '@widgets/bar/activeworkspace';

const Bar = (monitor: number) => Widget.Window({
	monitor,
	name: 'bar',
	anchor: ['top', 'left', 'right'],
	exclusivity: 'exclusive',
	class_name: 'Bar',
	child: Widget.CenterBox({
		start_widget: Widget.Box({
			children: [ActiveWindow, ActiveWorkspace],
			spacing: 8,
		}),
		center_widget: Widget.Box({}),
		end_widget: Widget.Box({}),
		class_name: 'Bar',
	}),
	height_request: 28,
});

export default Bar;