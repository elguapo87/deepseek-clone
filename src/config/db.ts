import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Define a custom type for mongoose connection caching
type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend globalThis correctly
interface GlobalWithMongoose extends globalThis.Global {
  _mongooseConnection?: MongooseConnection;
}

const globalWithMongoose = global as GlobalWithMongoose;

async function connectDB() {
  if (globalWithMongoose._mongooseConnection?.conn) {
    return globalWithMongoose._mongooseConnection.conn;
  }

  if (!globalWithMongoose._mongooseConnection) {
    globalWithMongoose._mongooseConnection = {
      conn: null,
      promise: null,
    };
  }

  if (!globalWithMongoose._mongooseConnection.promise) {
    globalWithMongoose._mongooseConnection.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalWithMongoose._mongooseConnection.conn = await globalWithMongoose._mongooseConnection.promise;
  return globalWithMongoose._mongooseConnection.conn;
}

export default connectDB;
