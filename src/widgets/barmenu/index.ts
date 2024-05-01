import MenuVis from '@services/menuvis';

export default Widget.Window({
	visible: MenuVis.bind('barmenu'),
	name: 'barmenu',
	anchor: ['top'],
	layer: 'overlay',
	css: 'background-color: transparent',
	child: Widget.Box({
		class_name: 'BarMenu',
	}),
});