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
			.then((output: CurrentWeather) => {
				this.#weather_val = {
					...output,
					hourly: output.hourly.map((hour) => {
						return {
							...hour,
							time: new Date(hour.time),
						};
					}),
					daily: output.daily.map((day) => {
						return {
							...day,
							time: new Date(day.time),
						};
					}),
				};
				this.notify('weather');
			})
			.catch(console.error);
	}
}

export const WeatherService = new Weather();
