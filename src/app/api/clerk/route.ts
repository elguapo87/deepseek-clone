import { Webhook } from "svix";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

interface ClerkUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: { email_address: string }[];
  image_url?: string;
}

interface ClerkEvent {
  data: ClerkUser;
  type: string;
}

export async function POST(req: NextRequest) {
  const signinSecret = process.env.SIGNIN_SECRET;
  if (!signinSecret) throw new Error("signinSecret is not defined");

  const wh = new Webhook(signinSecret);

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  try {
    const body = await req.text();
    const { data, type } = wh.verify(body, svixHeaders) as ClerkEvent;

    if (process.env.NODE_ENV !== "production") {
      console.log("🔔 Clerk Webhook Event:", JSON.stringify({ type, data }, null, 2));
    }

    await connectDB();

    switch (type) {
      case "user.created":
      case "user.updated":
        await userModel.findByIdAndUpdate(
          data.id,
          {
            email: data.email_addresses[0]?.email_address ?? "",
            name: `${data.first_name ?? ""} ${data.last_name ?? ""}`,
            image: data.image_url ?? "",
          },
          { upsert: true, new: true }
        );
        break;
      case "user.deleted":
        await userModel.findByIdAndDelete(data.id);
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
        break;
    }

    return NextResponse.json({ message: "Event received" }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 400 });
  }
}
