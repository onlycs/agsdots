import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';

export default function ImageFromUrl(url: string): GdkPixbuf.Pixbuf {
	const stream = Gio.File.new_for_uri(url).read(null);
	return GdkPixbuf.Pixbuf.new_from_stream(stream, null);
}