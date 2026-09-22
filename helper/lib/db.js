import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables");
}

/**
 * Global cache (important for Next.js & hot reload)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  // ✅ If already connected
  if (cached.conn) {
    return cached.conn;
  }

  // ✅ If connection is in progress
  if (!cached.promise) {
    console.log("🟡 MongoDB connecting...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // slow network safe
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => {
        console.log("🟢 MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("🔴 MongoDB connection failed:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}