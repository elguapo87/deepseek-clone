import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    if (isConnected) return; // Prevent reconnecting

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        isConnected = true;
        console.log("Database Connected");
    } catch (error) {
        console.error("Connection Failed", error);
        process.exit(1);
    }
};

export default connectDB;