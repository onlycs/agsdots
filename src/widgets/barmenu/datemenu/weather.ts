import Interactable from '@components/interactable';
import { WeatherService, type CurrentWeather } from '@services/weather';

const IconMap: Record<string, string> = {
	'clear-day': 'sun-outline',
	'clear-night': 'moon-outline',
	'rain': 'scattered-rain-outline',
	'snow': 'snow-outline',
	'sleet': 'snow-outline',
	'wind': 'windy',
	'cloudy': 'clouds-outline',
	'partly-cloudy-day': 'few-clouds-outline',
	'partly-cloudy-night': 'moon-clouds-outline',
	'thunderstorm': 'storm-outline',
	'hail': 'storm-outline',
};

const Weather = (w: CurrentWeather | undefined) => {
	if (!w) return Widget.Label({
		label: '...',
		class_name: 'Joe',
	});

	return Widget.Icon({
		icon: IconMap[w.icon] || 'sun-outline',
		class_name: 'Weather',
	});
};

export default () => Interactable({
	child: Widget.Box({
		class_name: 'WeatherBox',
		vertical: true,
		children: WeatherService.bind('weather').transform(w => [Weather(w)]),
	}),
});
