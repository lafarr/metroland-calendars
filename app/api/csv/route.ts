import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import * as xlsx from "xlsx";
import { Event } from "@/app/lib/models/event-model";
import { connectDb } from "@/app/lib/utils";
import { ArtEvent } from "@/app/lib/models/art-event-model";
import { TheaterEvent } from "@/app/lib/models/theater-event-model";

// EventType Title Venue StartDate EndDate Time Town Link

function getXlsData(base64String: string): any[] {
	try {
		const base64Data = base64String.replace(/^data:.*?;base64,/, '');

		const buffer = Buffer.from(base64Data, 'base64');

		const workbook = xlsx.read(buffer, { type: 'buffer', cellText: true, cellDates: false });

		// TODO: Look into this, we may need to iterate oaver all sheet names if we 
		// get lots of events in the future
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		const data = xlsx.utils.sheet_to_json(worksheet, {
			header: 1,
			raw: false,
			defval: '',
			blankrows: false,
			rawNumbers: false
		});

		// Extract rows (excluding headers)
		const rows = data.slice(1);

		return rows as any[];
	} catch (error: any) {
		throw new Error(`Failed to parse Excel file: ${error.message}`);
	}
}

// EventType Title Venue StartDate EndDate Time Town Link
async function handleArtEvents(base64String: string): Promise<mongoose.Document[]> {
	let events;
	try {
		events = getXlsData(base64String);
	} catch (err: any) {
		throw err;
	}
	const insertedEvents: mongoose.Document[] = [];

	const artEvents = events.filter((event) => event[0] === 'Art');
	for (const event of artEvents) {
		const newEvent = new ArtEvent({
			title: event[1],
			organizer: event[2],
			start: event[3],
			end: event[4],
			time: event[5],
		});
		await newEvent.save();
		insertedEvents.push(newEvent);
	}

	return insertedEvents;
}

async function handleTheaterEvents(base64String: string): Promise<mongoose.Document[]> {
	let events;
	try {
		events = getXlsData(base64String);
	} catch (err: any) {
		throw err;
	}
	const insertedEvents: mongoose.Document[] = [];

	const theaterEvents = events.filter((event) => event[0] === 'Theater');
	for (const event of theaterEvents) {
		const [m, d, y] = event[3].split('/');
		const [mm, dd, yy] = event[4].split('/');
		const end = event[4];
		const newEvent = new TheaterEvent({
			title: event[1],
			location: event[2],
			start: `${m}/${d}/${y.substring(2)}`,
			end: `${mm}/${dd}/${yy.substring(2)}`,
			link: event[7],
		});
		await newEvent.save();
		insertedEvents.push(newEvent);
	}

	return insertedEvents;
}

async function handleMusicEvents(base64String: string): Promise<mongoose.Document[]> {
	let events;
	try {
		events = getXlsData(base64String);
	} catch (err: any) {
		throw err;
	}
	const insertedEvents: mongoose.Document[] = [];

	const musicEvents = events.filter((event) => event[0] === 'Music');
	for (const event of musicEvents) {
		const newEvent = new Event({
			artist: event[1],
			venue: event[2],
			date: event[3],
			time: event[5],
			town: event[6],
			link: event[7] 
		});
		await newEvent.save();
		insertedEvents.push(newEvent);
	}

	return insertedEvents;
}

export async function POST(req: NextRequest) {
	try {
		await connectDb();
	} catch (err: any) {
		return NextResponse.json({ err: "Could not connect to db" }, { status: 500 });
	}

	let fileBase64;
	try {
		fileBase64 = (await req.json()).file;
	} catch (err: any) {
		return NextResponse.json({ err: "Could not convert request body to json" }, { status: 500 });
	}

	let events, artEvents, theaterEvents;
	try {
		events = await handleMusicEvents(fileBase64);
		artEvents = await handleArtEvents(fileBase64);
		theaterEvents = await handleTheaterEvents(fileBase64);

		for (const artEvent of artEvents) events.push(artEvent);
		for (const theaterEvent of theaterEvents) events.push(theaterEvent);
	} catch (err: any) {
		return NextResponse.json({ err: "Could not parse excel file" }, { status: 400 });
	}

	return NextResponse.json({ events: events });
}
