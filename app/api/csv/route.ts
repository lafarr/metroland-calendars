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

function validateMusicEventData(rows: any[]): string | undefined {
	// MM/DD/YYYY, HH:MM, Artist, Venue, Town, Ticket or Venue Link
	const datePattern = /(\d\d?)\s*[/-]\s*(\d\d?)\s*[/-]\s*(\d\d\d?\d?)\s*/;
	const timePattern = /(\d\d?):(\d\d)\s*([ap]m)?/;

	for (const row of rows) {
		if (row.length !== 6) {
			return `Incorrect number of columns: got ${row.length} expected 6`;
		}

		for (let i = 0; i < row.length; i++) {
			if (i === 0 && !datePattern.test(row[i].toLowerCase().trim())) {
				return `Invalid date: ${row[i]}`;
			}

			if (i === 1 && !timePattern.test(row[i].toLowerCase().trim())) {
				return `Invalid time: ${row[i]}`;
			}

			if (i === 2 && row[i] === "") {
				return `Empty artist: ${row[i]}`;
			}

			if (i === 3 && row[i] === "") {
				return `Empty venue: ${row[i]}`;
			}

			if (i === 4 && row[i] === "") {
				return `Empty town: ${row[i]}`;
			}

			if (i === 5 && row[i] === "") {
				return `Empty ticket or venue link: ${row[i]}`;
			}
		}
	}
	return undefined;
}

function validateOtherEventData(rows: any[]): string | undefined {
	// MM/DD/YYYY, MM/DD/YYYY, HH:MM, Title, Location, Website, [theater, film, poetry, visual arts]
	// start date, end date, time, title, location, website, category
	const datePattern = /(\d\d?)\s*[/-]\s*(\d\d?)\s*[/-]\s*(\d\d\d?\d?)\s*/;
	const timePattern = /(\d\d?):(\d\d)\s*([ap]m)?/;
	const validCategories = ["theater", "film", "poetry", "visual arts", "comedy"];

	// need to check dates - start date can be ongoing, end date can be n/a
	// need to check time
	// need to check category

	for (const row of rows) {
		if (row.length !== 7) {
			return `Incorrect number of columns: got ${row.length} expected 7`;
		}

		for (let i = 0; i < row.length; i++) {
			if (
				i === 0 &&
				row[i].toLowerCase() !== "ongoing" &&
				!datePattern.test(row[i].toLowerCase().trim())
			) {
				return `Invalid start date: ${row[i]}`;
			}

			if (
				i === 1 &&
				row[i] !== "n/a" &&
				row[i] !== "varies" &&
				!datePattern.test(row[i].toLowerCase().trim())
			) {
				return `Invalid end date: ${row[i]}`;
			}

			if (i === 2 && !timePattern.test(row[i].toLowerCase().trim()) && row[i].trim().toLowerCase() !== "varies" && row[i].trim().toLowerCase() !== "") {
				return `Invalid time: ${row[i]}`;
			}

			if (i === 3 && row[i] === "") {
				return `Empty title: ${row[i]}`;
			}

			if (i === 4 && row[i] === "") {
				return `Empty location: ${row[i]}`;
			}

			if (i === 5 && row[i] === "") {
				return `Empty website: ${row[i]}`;
			}

			if (i === 6 && !validCategories.includes(row[i].toLowerCase())) {
				return `Invalid category: ${row[i]}`;
			}
		}
	}
	return undefined;
}

function getXlsData(base64String: string): any {
	try {
		const base64Data = base64String.replace(/^data:.*?;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");
		const workbook = xlsx.read(buffer, {
			type: "buffer",
			cellText: true,
			cellDates: false,
		});

		// TODO: Look into this, we may need to iterate over all sheet names if we get lots of events in the future
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];

		const data = xlsx.utils.sheet_to_json(worksheet, {
			header: 1,
			raw: false,
			defval: "",
			blankrows: false,
			rawNumbers: false,
		});

		// Extract rows (excluding headers)
		const rows: any = data.slice(1);

		return {
			columnNames: data[0],
			data: rows,
		};
	} catch (error: any) {
		throw new Error(`Failed to parse Excel file: ${error.message}`);
	}
}

function fixDate(str: string): string {
	const datePattern = /(\d\d?)\s*[/-]\s*(\d\d?)\s*[/-]\s*(\d\d\d?\d?)\s*/;
	const [month, day, year] = getCaptureGroups(datePattern, str);
	if (!year) {
		console.log("messed up date");
		console.log(str);
	}
	return `${month}/${day}/${year.length === 2 ? "20" + year : year}`;
}

async function handleMusicEvents(
	base64String: string
): Promise<mongoose.Document[]> {
	let events, res, columnNames;
	try {
		res = getXlsData(base64String);
		const error: string | undefined = validateMusicEventData(res.data);
		if (error) {
			throw new Error(error);
		}
		events = res.data;
		columnNames = res.columnNames;
	} catch (err: any) {
		throw err;
	}

	const hasCorrectNumCols: boolean = columnNames.length === 6;
	const correctColNames = [
		"event name (band/artist)",
		"venue",
		"date",
		"time",
		"town",
		"ticket or venue link",
	];
	if (!hasCorrectNumCols) {
		// TODO: Throw an error here because there are an incorrect number of columns in the spreadsheet for this type
	}

	columnNames.forEach((colName: string) => {
		if (!correctColNames.includes(colName.toLowerCase())) {
			// TODO: Throw an error here because the column names aren't correct for music spreadsheet
		}
	});

	const insertedEvents: mongoose.Document[] = [];

	await Event.deleteMany({});

	for (const event of events) {
		const newEvent = new Event({
			artist: event[0],
			venue: event[1],
			date: fixDate(event[2]),
			time: event[3],
			town: event[4],
			link: event[5],
		});
		await newEvent.save();
		insertedEvents.push(newEvent);
	}
	return insertedEvents;
}

async function handleOtherEvents(
	base64String: string
): Promise<mongoose.Document[]> {
	let events, columnNames, res;
	try {
		res = getXlsData(base64String);
		const error: string | undefined = validateOtherEventData(res.data);
		if (error) {
			throw new Error(error);
		}
		events = res.data;
	} catch (err: any) {
		throw err;
	}

	const insertedEvents: mongoose.Document[] = [];

	await OtherEvent.deleteMany({});

	// start, end, title, venue
	for (const event of events) {
		const startDate =
			event[0].toLowerCase() !== "ongoing" ? event[0] : "1/1/2024";
		let endDate =
			event[1].trim() !== "" && event[1].toLowerCase() !== "varies"
				? event[1]
				: startDate;
		if (endDate.toLowerCase() === "n/a") {
			endDate = "1/1/2074";
		}
		const newEvent = new OtherEvent({
			title: event[3],
			venue: event[4],
			start: fixDate(startDate),
			end: fixDate(endDate),
			link: event[5],
			category: event[6],
			time: event[2],
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
		return NextResponse.json(
			{ err: "Could not connect to db" },
			{ status: 500 }
		);
	}

	let fileBase64, type;
	try {
		const body = await req.json();
		fileBase64 = body.file;
		type = body.type;
	} catch (err: any) {
		console.log(err);
		return NextResponse.json(
			{ err: "Could not convert request body to json" },
			{ status: 500 }
		);
	}

	let events = null;
	if (type === "music") {
		try {
			events = await handleMusicEvents(fileBase64);
		} catch (err: any) {
			console.log(err);
			return NextResponse.json({ message: err.message }, { status: 500 });
		 }
	} else if (type === "other") {
		try {
			events = await handleOtherEvents(fileBase64);
		} catch (err: any) {
			console.log(err);
			return NextResponse.json({ message: err.message }, { status: 500 });
		}
	} else {
		// TODO: Throw an error because it is an unknown spreadsheet type
	}

	return NextResponse.json({ events: events }, { status: 200 });
}