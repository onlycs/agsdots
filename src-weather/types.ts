export interface LatLng {
	lat: number;
	lng: number;
}

export interface WeatherInformation {
	summary: string;
	icon: string;
	precip: {
		intensity: number;
		probability: number;
		type: string;
		humidity: number;
	};
	temperature: {
		actual: number;
		apparent: number;
	};
	wind: number;
	visibility: number;
}

export interface DailyWeather extends Omit<WeatherInformation, 'temperature' | 'precip'> {
	time: Date;
	temperature: {
		min: number;
		max: number;
	};
	solar: {
		sunrise: number;
		sunset: number;
	};
	precip: {
		intensity: {
			min: number;
			max: number;
		};
	} & Omit<WeatherInformation['precip'], 'intensity'>;
}

export interface HourlyWeather extends WeatherInformation {
	time: Date;
}

export interface Alert {
	start: Date;
	end: Date;
}

export interface CurrentWeather {
	place: string;
	now: WeatherInformation;
	hourly: HourlyWeather[];
	daily: DailyWeather[];
	alerts: Alert[];
}
