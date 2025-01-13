import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import * as xlsx from "xlsx";
import { Event } from "@/app/lib/models/event-model";
import { connectDb } from "@/app/lib/utils";
import OtherEvent from "@/app/lib/models/other-event-model";


function getCaptureGroups(pattern: RegExp, str: string): string[] {
	const matches = pattern.exec(str);
	if (!matches) return [];
	return matches.slice(1);
}

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

function fixDate(str: string): string {
	const datePattern = /(\d\d?)\s*[/-]\s*(\d\d?)\s*[/-]\s*(\d\d\d?\d?)\s*/;
	const [month, day, year] = getCaptureGroups(datePattern, str);
	if (!year) {
		console.log('messed up date');
		console.log(str);
	}
	return `${month}/${day}/${year.length === 2 ? '20' + year : year}`;
}

// 0         1       2    3     4        5       6
// StartDate EndDate Time Title Location Website Category
async function handleMusicEvents(base64String: string): Promise<mongoose.Document[]> {
	let events;
	try {
		events = getXlsData(base64String);
	} catch (err: any) {
		throw err;
	}
	const insertedEvents: mongoose.Document[] = [];

	for (const event of events.filter((event) => event[6].toLowerCase() === 'music')) {
		const startDate = event[0].toLowerCase() !== 'Ongoing' ? event[0] : '1/1/2024';
		const newEvent = new Event({
			artist: event[3],
			venue: event[4],
			date: fixDate(startDate),
			time: event[2],
			town: '',
			link: event[5]
		});
		await newEvent.save();
		insertedEvents.push(newEvent);
	}

	return insertedEvents;
}

// 0         1       2    3     4        5       6
// StartDate EndDate Time Title Location Website Category
async function handleOtherEvents(base64String: string): Promise<mongoose.Document[]> {
	let events;
	try {
		events = getXlsData(base64String);
	} catch (err: any) {
		throw err;
	}
	const insertedEvents: mongoose.Document[] = [];

	// start, end, title, venue
	for (const event of events.filter((event) => event[6].toLowerCase() !== 'music')) {
		console.log(event[6].toLowerCase());
		const startDate = event[0].toLowerCase() !== 'ongoing' ? event[0] : '1/1/2024';
		const endDate = event[1].trim() !== '' ? event[1] : startDate;
		const newEvent = new OtherEvent({
			title: event[3],
			venue: event[4],
			start: fixDate(startDate),
			end: fixDate(endDate),
			link: event[5],
			category: event[6],
			time: event[2]
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
		console.log(err);
		return NextResponse.json({ err: "Could not connect to db" }, { status: 500 });
	}

	let fileBase64, type;
	try {
		const body = await req.json();
		fileBase64 = body.file;
		type = body.type;
	} catch (err: any) {
		console.log(err);
		return NextResponse.json({ err: "Could not convert request body to json" }, { status: 500 });
	}

	let events = null;
	try {
		events = await handleMusicEvents(fileBase64);
		events = await handleOtherEvents(fileBase64)
	} catch (err: any) {
		console.log('400 error');
		console.log(err);
		return NextResponse.json({ err: "Could not parse excel file" }, { status: 400 });
	}

	return NextResponse.json({ events: events });
}
