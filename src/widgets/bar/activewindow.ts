import Interactable from '@components/interactable';

const Hyprland = await Service.import('hyprland');

const ClassTitleOverrides: Record<string, (title: string) => string> = {
	'kitty': (_) => 'Terminal',
	'code-url-handler': title => title.replace('Visual Studio Code', 'VSCode'),
	'firefox': title => title.replace('Mozilla Firefox', 'Firefox'),
	'': _ => 'Desktop',
};

const ClassOverrides: Record<string, string> = {
	'code-url-handler': 'vscode',
	'': 'hyprland',
};

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


export default Interactable({
	child: Widget.Box({
		children: [
			Widget.Label({
				label: Hyprland.active.client.bind('title').transform(TitleTransformer),
				class_name: 'TextMain',
				max_width_chars: 10,
				truncate: 'end',
			}),
			Widget.Label({
				label: Hyprland.active.client.bind('class').transform(ClassTransformer),
				class_name: 'TextSub',
				max_width_chars: 10,
				truncate: 'end',
			}),
		],
		vertical: true,
		class_name: 'BarElement ActiveWindow',
	})
});