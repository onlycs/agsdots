const OpenMenu = Variable('');

export type KnownMenu = 'barmenu';

const MenuVis = {
	bind: (window: KnownMenu) => OpenMenu.bind().transform(n => n == window),
	bind_clickoff: () => OpenMenu.bind().transform(n => n != ''),
	closeall: () => { OpenMenu.setValue(''); },
	set: (window: KnownMenu | null) => { OpenMenu.setValue(window ?? ''); },
};

export default MenuVis;
