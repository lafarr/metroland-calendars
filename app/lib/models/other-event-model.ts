import mongoose from 'mongoose';
const { Schema } = mongoose;

const otherEventSchema = new Schema({
	title: String,
	venue: String,
	start: String,
	end: String,
	category: String,
	link: String,
	time: String
});

export default mongoose.models.OtherEvent || mongoose.model("OtherEvent", otherEventSchema);
