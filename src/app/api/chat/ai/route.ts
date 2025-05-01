export const maxDuration = 60;
import connectDB from "@/config/db";
import chatModel from "@/models/chatModel";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) return NextResponse.json({ success: false, message: "User not authorized" });
    if (!GEMINI_API_KEY) return NextResponse.json({ success: false, message: "Missing Gemini API Key" });

    await connectDB();

    const data = await chatModel.findOne({ userId, _id: chatId });
    if (!data) return NextResponse.json({ success: false, message: "Chat not found" });

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);

    // ✅ Build Gemini API request body
    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 512
      }
    };

    // ✅ Make request to Gemini API
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // If you ever switch to OAuth, you might use: "Authorization": `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify(geminiBody),
    });

    const geminiData = await geminiRes.json();

    // ✅ Debug log Gemini response (REMOVE or comment in prod)
    console.log("Gemini API Response:", JSON.stringify(geminiData, null, 2));

    // ✅ Extract response safely
    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json({
        success: false,
        message: "Gemini returned no usable content",
        raw: geminiData
      });
    }

    const geminiMessage = {
      role: "model",
      content: responseText,
      timestamp: Date.now(),
    };

    data.messages.push(geminiMessage);
    await data.save();

    if (geminiData.error) {
      return NextResponse.json({
        success: false,
        message: geminiData.error.message || "Unknown Gemini API error",
        raw: geminiData
      });
    }

    return NextResponse.json({ success: true, data: geminiMessage });

  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, error: errMessage });
  }
}
