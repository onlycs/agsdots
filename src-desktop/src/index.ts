import * as dotenv from 'dotenv';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { JSONClient } from 'google-auth-library/build/src/auth/googleauth';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';
const KEYFILE = 'oauth.json';

async function loadSaved() {
	try {
		const token = Bun.file(TOKEN_PATH);
		const str = await token.text();
		const json = JSON.parse(str);
		return google.auth.fromJSON(json);
	} catch (e) {
		return null;
	}
}

async function save(client: OAuth2Client) {
	const content = await Bun.file(KEYFILE).text();
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;

	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});

	await Bun.write(TOKEN_PATH, payload, {
		createPath: true,
	});
}

async function authorize(): Promise<JSONClient | OAuth2Client> {
	const saved = await loadSaved();
	if (saved) return saved;

	const client = await authenticate({
		scopes: SCOPES,
		keyfilePath: KEYFILE,
	});

	if (client.credentials) await save(client);
	return client;
}

async function list(client: any) {
	// get selected day from stdin
	let line;
	for await (const input of console) {
		line = input.trim();
		break;
	}

	if (!line) {
		console.log('No date provided.');
		return;
	}

	// stdin is an iso string
	const date = new Date(line);

	// set the time to midnight
	date.setHours(0, 0, 0, 0);

	// make an end-of-day date
	const end = new Date(date);
	end.setHours(23, 59, 59, 999);

	// create google calendar
	const cal = google.calendar({ version: 'v3', auth: client });

	// list calendar ids
	const cals_res = await cal.calendarList.list();
	const cals = cals_res.data.items;
	const ids = cals?.filter(cal => cal.selected).map((item) => item.id);
	if (!ids) return;

	// list events for each calendar
	const events = [];
	for (const id of ids) {
		if (!id) continue;

		const res = await cal.events.list({
			calendarId: id,
			timeMin: date.toISOString(),
			timeMax: end.toISOString(),
			singleEvents: true,
			orderBy: 'startTime',
		});

		if (!res.data.items) continue;
		events.push(...res.data.items);
	}

	console.log(JSON.stringify({
		date,
		events,
		cals
	}, null, 2));
}

async function main() {
	const client = await authorize();
	await list(client);
}

main().catch(console.error);