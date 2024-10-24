import Interactable from '@components/interactable';
import { timeof } from '@services/calendar';
import MenuVis from '@services/menuvis';
import { WeatherService, type CurrentWeather } from '@services/weather';
import type Gtk from 'gi://Gtk?version=3.0';
import { Align, Justification } from 'types/@girs/gtk-3.0/gtk-3.0.cjs';

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

const Header = (weather: CurrentWeather) => Widget.CenterBox({
	class_name: 'Header',
	start_widget: Widget.Icon({
		icon: IconMap[weather.now.icon],
		size: 32,
		xalign: 0,
	}),
	end_widget: Widget.Box({
		vertical: true,
		children: [
			Widget.Label({
				label: weather.place,
				class_name: 'Place',
				justify: Justification.RIGHT,
				xalign: 1,
			}),
			Widget.Label({
				label: weather.now.summary,
				class_name: 'Summary',
				justify: Justification.RIGHT,
				xalign: 1,
			}),
		],
	}),
});

const Temperatures = (weather: CurrentWeather) => Widget.Box({
	class_name: 'Temperatures',
	vertical: true,
	children: [
		Widget.Label({
			label: `${weather.now.temperature.actual}°`,
			halign: Align.START,
			class_name: 'Temperature',
		}),
		Widget.Box({
			class_name: 'HiLo',
			halign: Align.START,
			spacing: 4,
			children: [
				Widget.Label({
					label: `${weather.daily[0].temperature.max}°`,
					class_name: 'High',
				}),
				Widget.Label({
					label: `${weather.daily[0].temperature.min}°`,
					class_name: 'Low',
				}),
			],
		}),
	],
});

const Hourly = (weather: CurrentWeather) => Widget.Box({
	class_name: 'Hourly',
	halign: Align.END,
	valign: Align.END,
	spacing: 18,
	children: weather.hourly
		.filter((_, i) => i != 0 && i % 2 == 0)
		.filter((_, i) => i < 3)
		.map(hour => Widget.Box({
			class_name: 'Hour',
			vertical: true,
			children: [
				Widget.Label({
					label: `${hour.temperature.actual}°`,
					class_name: 'Temperature',
				}),
				Widget.Icon({
					icon: IconMap[hour.icon],
					size: 24,
				}),
				Widget.Label({
					label: timeof(hour.time),
					class_name: 'Time',
				}),
			],
		})),
});

export default () => Interactable({
	child: Widget.Box({
		class_name: 'Weather Card',
		vertical: true,
		children: WeatherService.bind('weather').transform((w) => {
			return w.handle_both(
				ok => ok.handle_both(
					res => [
						Header(res),
						Widget.CenterBox({
							start_widget: Temperatures(res),
							end_widget: Hourly(res),
						}),
					] as Gtk.Widget[],
					() => [Widget.Spinner()] as Gtk.Widget[],
				),
				_ => [Widget.Label({ label: 'Error fetching weather', class_name: 'Error' })],
			) as Gtk.Widget[];
		}),
	}),
	on_primary_click_release: () => {
		MenuVis.closeall();
		Utils.execAsync('gnome-weather').catch(console.error);
	},
	on_secondary_click_release: () => {
		WeatherService.force_update();
	},
});
