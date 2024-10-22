import type { Alert, CurrentWeather, DailyWeather, HourlyWeather, LatLng } from './types';

async function geocode(): Promise<LatLng> {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${Bun.env.LOCATION}&key=${Bun.env.GMAPS_KEY}`;
	const response = await fetch(url);
	const data = await response.json() as any;

	return data.results[0].geometry.location;
}

async function weather(): Promise<string> {
	const { lat, lng } = await geocode();
	const url = `https://api.pirateweather.net/forecast/${Bun.env.PW_KEY}/${lat}%2C${lng}`;
	const response = await fetch(url);
	const data = await response.json() as any;
	const current = data.currently;

	const weather = {
		place: Bun.env.LOCATION ?? 'Unknown',
		now: {
			summary: current.summary,
			icon: current.icon,
			precip: {
				intensity: current.precipIntensity,
				probability: current.precipProbability,
				type: current.precipType,
				humidity: current.humidity,
			},
			temperature: {
				actual: Math.round(current.temperature),
				apparent: Math.round(current.apparentTemperature),
			},
			wind: current.windSpeed,
			visibility: current.visibility,
		},
		hourly: data.hourly.data.map((hour: any) => {
			return {
				time: new Date(hour.time * 1000),
				summary: data.hourly.summary,
				icon: hour.icon,
				precip: {
					intensity: hour.precipIntensity,
					probability: hour.precipProbability,
					type: hour.precipType,
					humidity: hour.humidity,
				},
				temperature: {
					actual: Math.round(hour.temperature),
					apparent: Math.round(hour.apparentTemperature),
				},
				wind: hour.windSpeed,
				visibility: hour.visibility,
			} satisfies HourlyWeather;
		}),
		daily: data.daily.data.map((day: any) => {
			return {
				time: new Date(day.time * 1000),
				summary: data.daily.summary,
				icon: day.icon,
				temperature: {
					min: Math.round(day.temperatureMin),
					max: Math.round(day.temperatureMax),
				},
				solar: {
					sunrise: day.sunriseTime,
					sunset: day.sunsetTime,
				},
				precip: {
					intensity: {
						min: day.precipIntensityMin,
						max: day.precipIntensityMax,
					},
					probability: day.precipProbability,
					type: day.precipType,
					humidity: day.humidity,
				},
				wind: day.windSpeed,
				visibility: day.visibility,
			} satisfies DailyWeather;
		}),
		alerts: data.alerts.map((alert: any) => {
			return {
				start: new Date(alert.time * 1000),
				end: new Date(alert.expires * 1000),
			} satisfies Alert;
		}),
	} satisfies CurrentWeather;

	return JSON.stringify(weather, null, 2);
}

weather().then(console.log).catch(console.error);
