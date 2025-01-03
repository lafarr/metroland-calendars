import mongoose from 'mongoose';
const { Schema } = mongoose;

const eventSchema = new Schema({
  artist: String,
  venue: String,
  date: String,
  time: String,
  town: String,
  link: String,
});

export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
