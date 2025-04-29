import connectDB from "@/config/db";
import chatModel from "@/models/chatModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const userId = getAuth(req);
        if (!userId) return NextResponse.json({ success: false, message: "User not authenticated" });

        const { chatId, name } = await req.json();

        // Connect to the database and update the chat name
        await connectDB();

        await chatModel.findByIdAndUpdate({ _id: chatId, userId }, { name });

        return NextResponse.json({ success: true, message: "Chat renamed" });

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occured";
        return NextResponse.json({ success: false, error: errMessage });
    }
};