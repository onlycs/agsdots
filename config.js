await Utils.execAsync([
	'bun', 'build', `${App.configDir}/src/main.ts`,
	'--outfile', '/tmp/ags/main.js',
	'--external', 'resource://*',
	'--external', 'gi://*',
	'--external', 'file://*',
]); 

await import('file:///tmp/ags/main.js');
