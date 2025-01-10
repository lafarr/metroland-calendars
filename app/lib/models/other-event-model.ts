import mongoose from 'mongoose';
const { Schema } = mongoose;

const otherEventSchema = new Schema({
  artist: String,
  venue: String,
  date: String,
  time: String,
  town: String,
  link: String,
});

export const OtherEvent = mongoose.models.OtherEvent || mongoose.model("OtherEvent", otherEventSchema);
