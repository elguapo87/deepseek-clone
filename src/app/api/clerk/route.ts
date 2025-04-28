import { Webhook } from "svix";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

interface ClerkUser {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: { email_address: string }[];
  image_url?: string;
}

interface ClerkDeletedUser {
  id: string;
  deleted: boolean;
}

interface ClerkEvent {
  data: ClerkUser | ClerkDeletedUser;
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

    await connectDB();

    if (type === "user.created" || type === "user.updated") {
      const userData = {
        _id: (data as ClerkUser).id,
        email: (data as ClerkUser).email_addresses?.[0]?.email_address ?? "",
        name: `${(data as ClerkUser).first_name ?? ""} ${(data as ClerkUser).last_name ?? ""}`,
        image: (data as ClerkUser).image_url ?? "",
      };

      if (type === "user.created") {
        await userModel.create(userData);
      } else if (type === "user.updated") {
        await userModel.findByIdAndUpdate(userData._id, userData);
      }
    } else if (type === "user.deleted") {
      const userId = (data as ClerkDeletedUser).id;
      await userModel.findByIdAndDelete(userId);
    } else {
      console.log(`Unhandled event type: ${type}`);
    }

    return NextResponse.json({ message: "Event received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 400 });
  }
}
