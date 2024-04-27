import Bar from '@widgets/bar';

Utils.exec(`sass ${App.configDir}/styles/scss/index.scss ${App.configDir}/styles/.index.css`);

App.resetCss();
App.applyCss(`${App.configDir}/styles/.index.css`);

App.config({
	windows: [Bar(0)],
});