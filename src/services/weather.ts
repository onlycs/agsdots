import { Option, Result } from '@result';
import type { CurrentWeather } from '../../src-weather/types';
import { ExecError } from '@error/exec';
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

	#weather_val: Result<Option<CurrentWeather>, ExecError> = Result.ok(Option.none());

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
			.ext(ExecError.convert)
			.then_ok((output: CurrentWeather) => {
				this.#weather_val = Result.ok(Option.some({
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
				}));
			})
			.catch_result((err) => {
				this.#weather_val = Result.err(err);
			}, undefined, () => {
				this.notify('weather');
			});
	}

	force_update() {
		this.#weather_val = Result.ok(Option.none());
		this.notify('weather');
		this.#update();
	}
}

export const WeatherService = new Weather();
