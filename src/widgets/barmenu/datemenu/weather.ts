import Interactable from '@components/interactable';
import { WeatherService, type CurrentWeather } from '@services/weather';

const Weather = (w: CurrentWeather | undefined) => {
	if (!w) return Widget.Label({
		label: '...',
		class_name: 'Weather',
	});

	return Widget.Label({
		label: `${w.temperature}°`,
		class_name: 'Weather',
	});
};

export default () => Interactable({
	child: Widget.Box({
		class_name: 'Weather',
		vertical: true,
		children: WeatherService.bind('weather').transform(w => [Weather(w)]),
	}),
});
