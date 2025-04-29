import { Webhook } from "svix";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ClerkUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: { email_address: string }[];
  image_url?: string;
}

interface ClerkEvent {
  data: ClerkUser;
  type: string;
}

export async function POST(req: NextRequest) {
  const signinSecret = process.env.SIGNIN_SECRET;
  if (!signinSecret) throw new Error("signinSecret is not defined in dotenv");

  const wh = new Webhook(signinSecret);

  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": (await headerPayload).get("svix-id") ?? "",
    "svix-signature": (await headerPayload).get("svix-signature") ?? "",
    "svix-timestamp": (await headerPayload).get("svix-timestamp") ?? "",
  };

  const body = await req.text(); // raw text!
  const { data, type } = wh.verify(body, svixHeaders) as ClerkEvent;

  await connectDB();

  switch (type) {
    case "user.created":
    case "user.updated": {
      const userData = {
        _id: data.id,
        email: data.email_addresses?.[0]?.email_address ?? "",
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        image: data.image_url ?? "",
      };
      if (type === "user.created") {
        await userModel.create(userData);
      } else {
        await userModel.findByIdAndUpdate(data.id, userData);
      }
      break;
    }

    case "user.deleted":
      await userModel.findByIdAndDelete(data.id);
      break;

    default:
      console.log("Unhandled event type:", type);
      break;
  }

  return NextResponse.json({ message: "Event received" });
}
