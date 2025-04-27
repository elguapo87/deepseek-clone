import mongoose from "mongoose";

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseConnection | undefined; // <-- Must use var here
}

const cached = global.mongoose ?? { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    cached.promise = mongoose.connect(process.env.MONGODB_URI);
  }

  try {
    cached.conn = await cached.promise;
    global.mongoose = cached;
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    throw error; // important to throw error here
  }

  return cached.conn;
}
