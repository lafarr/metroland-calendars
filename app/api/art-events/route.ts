import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/app/lib/utils";
import { ArtEvent } from "@/app/lib/models/art-event-model";

export async function GET(req: NextRequest) {
	try {
		await connectDb();
		const artEvents  = await ArtEvent.find();	
		return NextResponse.json({ events: artEvents }, { status: 200 });
	} catch (err: any) {
		return NextResponse.json({ err: err }, { status: 400 });
	}
}
