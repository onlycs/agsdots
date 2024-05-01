export class OpenMenu extends Service {
	static {
		Service.register(this,
			{
				'open-changed': ['string'],
			},
			{
				'open': ['string'],
			}
		);
	}

	private open_window = '';

	get open() {
		return this.open_window;
	}

	set open(window: string | null) {
		if (this.open_window) Utils.execAsync(`ags -t ${this.open_window}`);

		if (!window) this.open_window = '';
		else Utils.execAsync(`ags -t ${window}`);

		this.open_window = window || '';
		this.onChange();
	}

	public toggle(window: string) {
		if (this.open == window) this.open = null;
		else this.open = window;
	}

	constructor() {
		super();
		this.onChange();
	}

	private onChange() {
		this.emit('open-changed', this.open_window);
		this.notify('open-changed');
	}

	connect(event = 'open-changed', callback: (_: this, ...args: any[]) => void) {
		return super.connect(event, callback);
	}
}

const openmenu = new OpenMenu();

export default openmenu;