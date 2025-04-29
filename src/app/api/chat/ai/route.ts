export const maxDuration = 60;
import connectDB from "@/config/db";
import chatModel from "@/models/chatModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) return NextResponse.json({ success: false, message: "User not authorized" });
    if (!GEMINI_API_KEY) return NextResponse.json({ success: false, message: "Missing Gemini API Key" });

    await connectDB();

    const data = await chatModel.findOne({ userId, _id: chatId });

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    // Make request to Gemini API
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const geminiData = await geminiRes.json();

    if (!geminiData || !geminiData.candidates || !geminiData.candidates.length) {
      return NextResponse.json({ success: false, message: "No response from Gemini API" });
    }

    const responseText = geminiData.candidates[0].content.parts[0].text;

    const geminiMessage = {
      role: "model",
      content: responseText,
      timestamp: Date.now(),
    };

    data.messages.push(geminiMessage);
    await data.save();

    return NextResponse.json({ success: true, data: geminiMessage });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, error: errMessage });
  }
}