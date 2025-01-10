import { OtherEvent } from "@/app/lib/models/other-event-model";
import { connectDb } from "@/app/lib/utils";
import { NextResponse } from "next/server";

function getCaptureGroups(pattern: RegExp, str: string): string[] {
	const matches = pattern.exec(str);
	if (!matches) return [];
	return matches.slice(1);
}

export async function GET() {
	try {
		await connectDb();
		const events = await OtherEvent.find();
		const pattern = /(\d\d?)[/-](\d\d?)[-/](\d\d\d?\d?)/

		const cleanedEvents: any[] = events.map((event, idx: number) => {
			const date = event.date;
			let year = getCaptureGroups(pattern, date).at(-1);
			if (year?.length === 2) {
				year = "20" + year;
			}
			// start, end, title, venue, link
			return { 
				_id: event._id,
				 title: event.title,
				 venue: event.venue,
				 link: event.link,
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
