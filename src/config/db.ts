import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Extend globalThis WITHOUT namespace
declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// No initialization outside — only inside the function!

async function connectDB() {
  if (!global.mongooseConnection) {
    global.mongooseConnection = { conn: null, promise: null };
  }

  if (global.mongooseConnection.conn) {
    return global.mongooseConnection.conn;
  }

  if (!global.mongooseConnection.promise) {
    global.mongooseConnection.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  global.mongooseConnection.conn = await global.mongooseConnection.promise;
  return global.mongooseConnection.conn;
}

export default connectDB;
