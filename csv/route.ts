import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import * as xlsx from "xlsx";
import { Event } from "@/app/lib/models/event-model";
import { connectDb } from "@/app/lib/utils";

function getXlsData(base64String: string): any[] {
	try {
		console.log(base64String);
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
		console.log('Rows of excel file: ' + rows);

		return rows as any[];
	} catch (error: any) {
		throw new Error(`Failed to parse Excel file: ${error.message}`);
	}
}

async function handleMusicEvents(base64String: string): Promise<mongoose.Document[]> {
	let events;
	try {
		events = getXlsData(base64String);
	} catch (err: any) {
		throw err;
	}
	const insertedEvents: mongoose.Document[] = [];

	for (const event of events) {
		const newEvent = new Event({ artist: event[0], venue: event[1], date: event[2], time: event[3], town: event[4], link: event[5] });
		await newEvent.save();
		insertedEvents.push(newEvent);
	}

	return insertedEvents;
}

// function handleArtEvents(base64String: string): mongoose.Document[] {
//
// }
//
// function handleTheaterEvents(base64String: string): mongoose.Document[] {
//
// }

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

	let events;
	try {
		events = await handleMusicEvents(fileBase64);
	} catch (err: any) {
		return NextResponse.json({ err: "Could not parse excel file" }, { status: 400 });
	}

	return NextResponse.json({ events: events });
}
