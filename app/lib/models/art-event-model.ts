import mongoose from 'mongoose';
const { Schema } = mongoose;

const ArtEventSchema = new Schema({
	title: String,
	organizer: String,
	details: String,
	cost: String,
	time: String,
	start: String,
	end: String,
});

export const ArtEvent = mongoose.models.art_event || mongoose.model("art_event", ArtEventSchema);
