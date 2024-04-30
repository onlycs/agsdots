import Bar from '@widgets/bar';

Utils.exec(`sass ${App.configDir}/styles/index.scss /tmp/ags/index.css`);
App.resetCss();
App.applyCss('/tmp/ags/index.css');

App.config({
	windows: [Bar(0)],
});