import OtherEvent from "@/app/lib/models/other-event-model";
import { connectDb } from "@/app/lib/utils";
import { NextResponse } from "next/server";
import * as types from "@/app/lib/types";


function getCaptureGroups(pattern: RegExp, str: string): string[] {
	const matches = pattern.exec(str);
	if (!matches) return [];
	return matches.slice(1);
}

export async function GET() {
	try {
		await connectDb();
		const events = await OtherEvent.find();
		const pattern = /(\d\d?)[/-](\d\d?)[-/](\d\d\d?\d?)/;
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		const cleanedEvents: types.OtherEvent[] = events.filter((event: types.OtherEvent) => {
			const date = event.end;
			let endYear;
			if (typeof date === 'string') {
				const endCaptures = getCaptureGroups(pattern, date);
				endYear = endCaptures[endCaptures.length - 1];
				if (endYear?.length === 2) {
					endYear = "20" + endYear;
				}
				if (typeof date === 'string') {
					const [month, day] = date.split('/');
					return new Date(parseInt(endYear ?? ''), parseInt(month) - 1, parseInt(day)) >= today;
				}
			}
			return new Date(parseInt(endYear ?? ''), date.getMonth(), date.getDate()) >= today;
		})
			.map((event) => {
				const startCaptures = getCaptureGroups(pattern, event.start);
				const endCaptures = getCaptureGroups(pattern, event.end);
				let startYear = startCaptures[startCaptures.length - 1]
				let endYear = endCaptures[endCaptures.length - 1];

				if (startYear?.length === 2) startYear = '20' + startYear;
				if (endYear?.length === 2) endYear = '20' + endYear;

				// start, end, title, venue, link
				return {
					_id: event._id,
					title: event.title,
					venue: event.venue,
					start: `${startCaptures[0]}/${startCaptures[1]}/${startYear}`,
					end: `${endCaptures[0]}/${endCaptures[1]}/${endYear}`,
					category: event.category,
					link: event.link,
					time: event.time
				};
			});

		return NextResponse.json({ events: cleanedEvents });
	} catch (err) {
		console.log(err);
		return NextResponse.json({ error: true });
	}
}
