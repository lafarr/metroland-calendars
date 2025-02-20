import mongoose from "mongoose";
import * as xlsx from "xlsx";
import { EventModel } from "@/app/lib/models/event-model";
import { connectDb } from "@/app/lib/utils";
import OtherEvent from "@/app/lib/models/other-event-model";
import { NextRequest, NextResponse } from "next/server";

function getCaptureGroups(pattern: RegExp, str: string): string[] {
	const matches = pattern.exec(str);
	if (!matches) return [];
	return matches.slice(1);
}

function validateMusicEventData(rows: string[][]): string | undefined {

	const datePattern = /(\d\d?)\s*[/-]\s*(\d\d?)\s*[/-]\s*(\d\d\d?\d?)\s*/;
	const timePattern = /(\d\d?):(\d\d)\s*([ap]m)?/;

	for (const row of rows) {
		if (row.length !== 6) {
			return `Incorrect number of columns: got ${row.length} expected 6`;
		}

		for (let i = 0; i < row.length; i++) {
			const cleanedValue = row[i].toLowerCase().trim();
			switch (i) {
				case 0:
					if (cleanedValue === "") {
						return `Empty artist: ${row[i]}`;
					}
					break;
				case 1:
					if (cleanedValue === "") {
						return `Empty venue: ${row[i]}`;
					}
					break;
				case 2:
					if (!datePattern.test(cleanedValue)) {
						return `Invalid date: ${row[i]}`;
					}
					break;
				case 3:
					if (!timePattern.test(cleanedValue)) {
						return `Invalid time: ${row[i]}`;
					}
					break;
				case 4:
					if (cleanedValue === "") {
						return `Empty town: ${row[i]}`;
					}
					break;
			}
		}
	}
	return undefined;
}

function validateOtherEventData(rows: string[][]): string | undefined {
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
			const cleanedValue = row[i].toLowerCase().trim();
			if (
				i === 0 &&
				cleanedValue !== "ongoing" &&
				!datePattern.test(cleanedValue)
			) {
				return `Invalid start date: ${row[i]}`;
			}

			if (
				i === 1 &&
				cleanedValue !== "n/a" &&
				cleanedValue !== "varies" &&
				!datePattern.test(cleanedValue)
			) {
				return `Invalid end date: ${row[i]}`;
			}

			if (
				i === 2 &&
				!timePattern.test(cleanedValue) &&
				cleanedValue !== "varies" &&
				cleanedValue !== ""
			) {
				return `Invalid time: ${row[i]}`;
			}

			if (i === 3 && cleanedValue === "") {
				return `Empty title: ${row[i]}`;
			}

			if (i === 4 && cleanedValue === "") {
				return `Empty location: ${row[i]}`;
			}

			if (i === 5 && cleanedValue === "") {
				return `Empty website: ${row[i]}`;
			}

			if (i === 6 && !validCategories.includes(cleanedValue)) {
				return `Invalid category: ${row[i]}`;
			}
		}
	}
	return undefined;
}

function getXlsData(base64String: string): {
	columnNames: string[];
	data: string[][];
} {
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
		// Extract rows (excluding headers) and ensure proper typing
		const rows = data.slice(1) as string[][];

		return {
			columnNames: data[0] as string[],
			data: rows,
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new Error(`Failed to parse Excel file: ${error.message}`);
		}
		throw new Error('Failed to parse Excel file: Unknown error');
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
	const res = getXlsData(base64String);
	const error: string | undefined = validateMusicEventData(res.data);
	if (error) {
		throw new Error(error);
	}
	const events = res.data;
	const insertedEvents: mongoose.Document[] = [];

	await EventModel.deleteMany({});

	for (const event of events) {
		const newEvent = new EventModel({
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
	const res = getXlsData(base64String);
	const error: string | undefined = validateOtherEventData(res.data);
	if (error) {
		throw new Error(error);
	}
	const events = res.data;

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
	} catch (err: unknown) {
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
	} catch (err: unknown) {
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
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.log(err.message);
				return NextResponse.json({ message: err.message }, { status: 500 });
			} else {
				console.log(err);
				return NextResponse.json({ message: "Unknown error" }, { status: 500 });
			}
		}
	} else if (type === "other") {
		try {
			events = await handleOtherEvents(fileBase64);
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.log(err.message);
				return NextResponse.json({ message: err.message }, { status: 500 });
			} else {
				console.log(err);
				return NextResponse.json({ message: "Unknown error" }, { status: 500 });
			}
		}
	} else {
		return NextResponse.json({ message: "Unknown spreadsheet type" }, { status: 500 });
	}

	return NextResponse.json({ events: events }, { status: 200 });
}
