import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ||'mongodb://localhost:27017/shalbanfood' ;

if (!MONGODB_URI) {
	throw new Error('MONGODB_URI is not defined');
}

const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
	globalForMongoose.mongoose = {
		conn: null,
		promise: null,
	};
}

export async function connectDB() {
	const cached = globalForMongoose.mongoose;

	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		console.log('🟡 Connecting to MongoDB...');

		cached.promise = mongoose
			.connect(MONGODB_URI, {
				bufferCommands: false,
				serverSelectionTimeoutMS: 10000,
				socketTimeoutMS: 45000,
				maxPoolSize: 10,
			})
			.then((mongooseInstance) => {
				console.log('🟢 MongoDB connected');
				return mongooseInstance;
			})
			.catch((error) => {
				cached.promise = null;

				console.error('🔴 MongoDB connection failed:', error);

				throw error;
			});
	}

	cached.conn = await cached.promise;

	return cached.conn;
}
