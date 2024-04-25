import ActiveWindow from '@widgets/bar/activewindow';

const Bar = (monitor: number) => Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: ['top', 'left', 'right'],
    exclusivity: 'exclusive',
    class_name: 'Bar',
	child: ActiveWindow,
    height_request: 30,
});

export default Bar;