import connectDB from "@/config/db";
import chatModel from "@/models/chatModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log("userId in /api/chat/get:", userId);
    if (!userId) return NextResponse.json({ success: false, message: "User not authenticated" });

    await connectDB();
    const data = await chatModel.find({ userId });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, error: errMessage });
  }
}
