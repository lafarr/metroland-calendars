import { connectDb } from "@/app/lib/utils";
import { Event } from "@/app/lib/models/event-model";
import { NextRequest, NextResponse } from "next/server";

function getCaptureGroups(pattern: RegExp, str: string): string[] {
	const matches = pattern.exec(str);
	if (!matches) return [];
	return matches.slice(1);
}

export async function GET() {
	try {
		await connectDb();
		const events = await Event.find();
		const pattern = /(\d\d?)\/(\d\d?)\/(\d\d\d?\d?)/

		const cleanedEvents = events.map((event, idx: number) => {
			const date = event.date;
			let [month, day, year] = getCaptureGroups(pattern, date);
			if (year.length === 2) {
				year = "20" + year;
			}
			return { _id: event._id, artist: event.artist, venue: event.venue, date: event.date, link: event.link, time: event.time, start: event.date, end: event.date };
		});

		console.log(cleanedEvents);
		return NextResponse.json({ events: cleanedEvents });
	} catch (err) {
		return NextResponse.json({ error: true });
	}
}

export async function POST(req: NextRequest) {
	try {
		await connectDb();
	} catch (err) {
		return NextResponse.json({ error: 'Could not connect to database' }, { status: 500 });
	}

	let newEvent = null;
	let newEventData = null;

	try {
		newEventData = await req.json();
		newEvent = new Event();
	} catch (err) {
		return NextResponse.json({ error: 'Could not convert request body to JSON' }, { status: 500 });
	}

	for (const key in newEventData) {
		newEvent[key] = newEventData[key];
	}

	try {
		await newEvent.save();
	} catch (err) {
		return NextResponse.json({ error: 'Could not save new event to database' }, { status: 500 });
	}

	return NextResponse.json({ event: newEvent.toObject() }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
	try {
		await connectDb();
	} catch (err) {
		return NextResponse.json({ error: 'Could not connect to database' }, { status: 500 });
	}

	const searchParams = req.nextUrl.searchParams;
	const id = searchParams.get('id');

	try {
		await Event.deleteOne({ _id: id });
	} catch (err) {
		return NextResponse.json({ error: 'Could not delete document from collection' }, { status: 500 });
	}

	return NextResponse.json({ status: 204 });
}

export async function PUT(req: NextRequest) {
	try {
		await connectDb();
	} catch (err) {
		return NextResponse.json({ error: 'Could not connect to database' }, { status: 500 });
	}

	let body = null;
	try {
		body = await req.json();
	} catch (err: any) {
		return NextResponse.json({ error: 'Could not convert body to JSON' }, { status: 500 });
	}

	try {
		const doc = await Event.findOne({ _id: body._id });
		if (!doc) return NextResponse.json({ error: 'Could not find the given document' }, { status: 404 });
		for (const prop in body) {
			doc[prop] = body[prop];
		}
		await doc.save();
		return NextResponse.json({ event: doc }, { status: 200 });
	} catch (err) {
		return NextResponse.json({ error: 'Could not update the given document' }, { status: 500 });
	}
}

