// extends:
//   - eslint:recommended
//   - "@nuxtjs/eslint-config-typescript"
//   - "plugin:vue/vue3-essential"
//   - "plugin:vue/vue3-strongly-recommended"
//   - "plugin:vue/vue3-recommended"

// env:
//   browser: true
//   node: true

// rules:
//   indent:
//     - warn
//     - tab
//     - SwitchCase: 1

//   quotes:
//     - warn
//     - single

//   semi:
//     - error
//     - always


export default [
	{
		'rules': {
			'semi': 'error',
			'quotes': ['warn', 'single'],
			'indent': ['warn', 'tab', { 'SwitchCase': 1 }],
		}
	}
];