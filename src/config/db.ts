import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Extend globalThis properly
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

// Initialize the global connection object
const globalWithMongoose = global as typeof globalThis & {
  mongooseConnection: MongooseConnection;
};

async function connectDB() {
  if (!globalWithMongoose.mongooseConnection) {
    globalWithMongoose.mongooseConnection = { conn: null, promise: null };
  }

  if (globalWithMongoose.mongooseConnection.conn) {
    return globalWithMongoose.mongooseConnection.conn;
  }

  if (!globalWithMongoose.mongooseConnection.promise) {
    globalWithMongoose.mongooseConnection.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalWithMongoose.mongooseConnection.conn = await globalWithMongoose.mongooseConnection.promise;
  return globalWithMongoose.mongooseConnection.conn;
}

export default connectDB;
export {}; // <-- important for TypeScript to treat the file as a module
