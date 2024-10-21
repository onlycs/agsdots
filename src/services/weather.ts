import type { CurrentWeather } from '../../src-weather/types';
export type { CurrentWeather } from '../../src-weather/types';

class Weather extends Service {
	static {
		Service.register(
			this,
			{},
			{
				weather: ['gobject', 'r'],
			},
		);
	}

	#weather_val: CurrentWeather | undefined = undefined;

	constructor() {
		super();

		Utils.interval(1000 * 60 * 60, () => {
			this.#update();
		});
	}

	get weather() {
		return this.#weather_val;
	}

	#update() {
		const command = `nu -c 'cd ${App.configDir}; bun run --silent weather'`;
		Utils.execAsync(command)
			.then(JSON.parse)
			.then((output) => {
				this.#weather_val = output;
				this.notify('weather');
			})
			.catch(console.error);
	}
}

export const WeatherService = new Weather();
