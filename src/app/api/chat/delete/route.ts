import connectDB from "@/config/db";
import chatModel from "@/models/chatModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {userId} = getAuth(req);
        if (!userId) return NextResponse.json({ success: false, message: "User not authenticated" });

        const {chatId} = await req.json();

        // Connect to the database and delete the chat
        await connectDB();
        
        await chatModel.deleteOne({ _id: chatId, userId });

        return NextResponse.json({ success: true, message: "Chat deleted" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occured";
        return NextResponse.json({ success: false, error: errMessage });
    }
};