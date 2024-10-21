import type { calendar_v3 } from '@googleapis/calendar';

export interface CalendarResponse {
	date: Date;
	events: Record<string, calendar_v3.Schema$Events>;
}
