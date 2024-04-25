const Hyprland = await Service.import('hyprland');

const ClassTitleOverrides: {
	[key: string]: (title: string) => string
} = {
	"kitty": title => "Terminal - " + title,
	"code-url-handler": title => title.replace("Visual Studio Code", "VSCode"),
	"firefox": title => title.replace("Mozilla Firefox", "Firefox"),
	"": _ => "Desktop",
}

const ClassOverrides: {
	[key: string]: string
} = {
	"code-url-handler": "code",
	"": "hyprland",
}

function TitleTransformer(title: string): string {
	const activeclass = Hyprland.active.client.class;

	if (activeclass in ClassTitleOverrides) {
		return ClassTitleOverrides[activeclass](title);
	}

	return title;
}

function ClassTransformer(classname: string): string {
	if (classname in ClassOverrides) {
		return ClassOverrides[classname];
	}

	return classname;
}

const ActiveBox = Widget.EventBox({
	child: Widget.Box({
		children: [
			Widget.Label({
				label: Hyprland.active.client.bind('title').transform(TitleTransformer),
				class_name: 'ActiveTitle',
				max_width_chars: 10,
				truncate: 'end',
			}),
			Widget.Label({
				label: Hyprland.active.client.bind('class').transform(ClassTransformer),
				class_name: 'ActiveClass',
				max_width_chars: 10,
				truncate: 'end',
			}),
		],
		vertical: true,
		class_name: 'ActiveBox',
	}),
	class_name: 'ActiveEventBox',
	on_hover: self => {
		self.child.class_name += ' Hover';
	},
	on_hover_lost: self => {
		self.child.class_name = self.child.class_name.replace(' Hover', '');
	},
	setup: self => self.on("leave-notify-event", self.on_hover_lost),
});

export default Widget.Box({
	children: [ActiveBox],
	class_name: 'ActiveWindow',
});