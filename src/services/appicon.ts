import Gtk from 'gi://Gtk';

const IconTheme = Gtk.IconTheme.get_default();
const Icons = IconTheme.list_icons('Applications');

export default function GetIcon(name: string) {
	if (Icons.includes(name)) return name;
	else return 'notifications-applet';
}