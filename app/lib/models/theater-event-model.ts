import mongoose from 'mongoose';
const { Schema } = mongoose;

const TheaterEventSchema = new Schema({
	title: String,
	location: String,
	start: String,
	end: String,
	link: String
});

export const TheaterEvent = mongoose.models.theater_event || mongoose.model("theater_event", TheaterEventSchema);
