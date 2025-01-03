import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/app/lib/utils";
import { TheaterEvent } from "@/app/lib/models/theater-event-model";

export async function GET(req: NextRequest) {
	try {
		await connectDb();
		const artEvents  = await TheaterEvent.find();	
		return NextResponse.json({ events: artEvents }, { status: 200 });
	} catch (err: any) {
		return NextResponse.json({ err: err }, { status: 400 });
	}
}

