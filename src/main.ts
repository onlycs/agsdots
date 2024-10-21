import Bar from '@widgets/bar';
import BarMenu from '@widgets/barmenu';
import ClickOff from '@widgets/clickoff';

App.addIcons(`${App.configDir}/res`);

Utils.monitorFile('/tmp/ags/index.css', () => {
	App.resetCss();
	App.applyCss('/tmp/ags/index.css');
});

Utils.execAsync(
	[
		'nodemon',
		'-w', App.configDir,
		'--exec', ...[
			'sass',
			`${App.configDir}/styles/index.scss`,
			'/tmp/ags/index.css',
		],
		'--ext', 'scss',
	],
).catch(console.error);

App.config({
	windows: [Bar, BarMenu, ClickOff],
});
