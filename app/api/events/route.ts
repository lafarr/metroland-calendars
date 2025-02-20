import { connectDb } from "@/app/lib/utils";
import { EventModel } from "@/app/lib/models/event-model";
import { NextRequest, NextResponse } from "next/server";
import { MusicEvent } from "@/app/lib/types";

function getCaptureGroups(pattern: RegExp, str: string): string[] {
	const matches = pattern.exec(str);
	if (!matches) return [];
	return matches.slice(1);
}

export async function GET() {
	try {
		await connectDb();
		const events = await EventModel.find();
		const pattern = /(\d\d?)[/-](\d\d?)[-/](\d\d\d?\d?)/;
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const cleanedEvents: MusicEvent[] = events.filter((event: MusicEvent) => {
			const date = event.date;
			if (typeof date === 'string') {
				let year = getCaptureGroups(pattern, date).at(-1);
				if (year?.length === 2) {
					year = "20" + year;
				}
				const [month, day, _] = date.split('/');
				return new Date(parseInt(year ?? ''), parseInt(month) - 1, parseInt(day)) >= today;
			}
			return new Date(date) >= today;
		})
			.map((event) => {
				return {
					_id: event._id,
					artist: event.artist,
					venue: event.venue,
					date: event.date,
					link: event.link,
					time: event.time,
					town: event.town,
					start: event.date,
					end: event.date
				};
			});

		return NextResponse.json({ events: cleanedEvents });
	} catch (err) {
		console.log(err);
		return NextResponse.json({ error: true });
	}
}

export async function POST(req: NextRequest) {
	try {
		await connectDb();
	} catch (_) {
		return NextResponse.json({ error: 'Could not connect to database' }, { status: 500 });
	}

	let newEvent = null;
	let newEventData = null;

	try {
		newEventData = await req.json();
		newEvent = new EventModel();
	} catch (_) {
		return NextResponse.json({ error: 'Could not convert request body to JSON' }, { status: 500 });
	}

	for (const key in newEventData) {
		newEvent[key] = newEventData[key];
	}

	try {
		await newEvent.save();
	} catch (_) {
		return NextResponse.json({ error: 'Could not save new event to database' }, { status: 500 });
	}

	return NextResponse.json({ event: newEvent.toObject() }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
	try {
		await connectDb();
	} catch (_) {
		return NextResponse.json({ error: 'Could not connect to database' }, { status: 500 });
	}

	const searchParams = req.nextUrl.searchParams;
	const id = searchParams.get('id');

	try {
		await EventModel.deleteOne({ _id: id });
	} catch (_) {
		return NextResponse.json({ error: 'Could not delete document from collection' }, { status: 500 });
	}

	return NextResponse.json({ status: 204 });
}

export async function PUT(req: NextRequest) {
	try {
		await connectDb();
	} catch (_) {
		return NextResponse.json({ error: 'Could not connect to database' }, { status: 500 });
	}

	let body = null;
	try {
		body = await req.json();
	} catch (_) {
		return NextResponse.json({ error: 'Could not convert body to JSON' }, { status: 500 });
	}

	try {
		const doc = await EventModel.findOne({ _id: body._id });
		if (!doc) return NextResponse.json({ error: 'Could not find the given document' }, { status: 404 });
		for (const prop in body) {
			doc[prop] = body[prop];
		}
		await doc.save();
		return NextResponse.json({ event: doc }, { status: 200 });
	} catch (_) {
		return NextResponse.json({ error: 'Could not update the given document' }, { status: 500 });
	}
}

