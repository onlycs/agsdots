export interface LatLng {
	lat: number;
	lng: number;
}

export interface CurrentWeather {
	summary: string;
	icon: string;
	precipIntensity: number;
	precipProbability: number;
	precipType: string;
	temperature: number;
	apparentTemperature: number;
	humidity: number;
	windSpeed: number;
	visibility: number;
}
