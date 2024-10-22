import type { calendar_v3 } from '@googleapis/calendar';

export interface CalendarKey {
	month: number;
	year: number;
}

export interface CalendarResponse {
	key: CalendarKey;
	generated: Date;
	events: Record<string, calendar_v3.Schema$Events>;
}
