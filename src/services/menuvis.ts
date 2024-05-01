const OpenMenu = Variable('');

const MenuVis = {
	bind: (window: string) => OpenMenu.bind().transform(n => n == window),
	bind_clickoff: () => OpenMenu.bind().transform(n => n != ''),
	closeall: () => OpenMenu.setValue(''),
	set: (window: string | null) => OpenMenu.setValue(window || ''),
};

export default MenuVis;