import connectDB from "@/config/db";
import chatModel from "@/models/chatModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return NextResponse.json({ success: false, message: "User not authenticated" });

        // Prepare chat data to be saved in the database 
        const chatData = {
            userId,
            messages: [],
            name: "New Chat"
        };

        // Connect to the database and create a new chat
        await connectDB();

        await chatModel.create(chatData);

        return NextResponse.json({ success: true, message: "Chat created" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occured";
        return NextResponse.json({ success: false, error: errMessage });
    }
};