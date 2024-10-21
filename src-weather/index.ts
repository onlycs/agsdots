import type { CurrentWeather, LatLng } from './types';

async function geocode(): Promise<LatLng> {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${Bun.env.LOCATION}&key=${Bun.env.GMAPS_KEY}`;
	const response = await fetch(url);
	const data = await response.json() as any;

	return data.results[0].geometry.location;
}

function mmph_to_inph(mmph: number): number {
	return mmph * 0.0393701;
}

function km_to_mi(km: number): number {
	return km * 0.621371;
}

async function weather(): Promise<string> {
	const { lat, lng } = await geocode();
	const url = `https://api.pirateweather.net/forecast/${Bun.env.PW_KEY}/${lat}%2C${lng}`;
	const response = await fetch(url);
	const data = await response.json() as any;
	const current = data.currently;

	const weather = {
		summary: current.summary,
		icon: current.icon,
		precipIntensity: mmph_to_inph(current.precipIntensity),
		precipProbability: current.precipProbability,
		precipType: current.precipType,
		temperature: Math.round(current.temperature),
		apparentTemperature: Math.round(current.apparentTemperature),
		humidity: current.humidity,
		windSpeed: km_to_mi(current.windSpeed),
		visibility: km_to_mi(current.visibility),
	} satisfies CurrentWeather;

	return JSON.stringify(weather, null, 2);
}

weather().then(console.log).catch(console.error);
