export default Widget.Window({
	visible: false,
	class_name: 'BarMenu',
	name: 'barmenu',
	anchor: ['top'],
	margins: [16,0,0,0],
	child: Widget.Box({
		css: 'background-color: black;',
		width_request: 100,
		height_request: 100,
	}),
});