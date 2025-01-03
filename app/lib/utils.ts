import mongoose from 'mongoose';

export async function connectDb() {
	const URI = process.env.MONGO_URI;
	if (!URI) {
		throw new Error('Could not locate uri in .env');
	}

	return await mongoose.connect(URI);
}
