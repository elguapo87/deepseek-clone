import { Webhook } from "svix";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

type WebhookEvent = {
  data: any;
  type: string;
};

export async function POST(req: NextRequest) {
  if (!process.env.SIGNIN_SECRET) {
    throw new Error("SIGNIN_SECRET is not defined in environment variables");
  }

  const wh = new Webhook(process.env.SIGNIN_SECRET);

  const headerPayload = headers();
  const svixHeaders = {
    "svix-id": (await headerPayload).get("svix-id") ?? "",         // force empty string if missing
    "svix-signature": (await headerPayload).get("svix-signature") ?? "",
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const evt = wh.verify(body, svixHeaders) as WebhookEvent;  // cast to expected type
  const { data, type } = evt;

  await connectDB();

  switch (type) {
    case "user.created": {
      const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url || "",
        resume: ""
      };
      await userModel.create(userData);
      return NextResponse.json({});
    }

    case "user.updated": {
      const userData = {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url || "",
      };
      await userModel.findByIdAndUpdate(data.id, userData);
      return NextResponse.json({});
    }

    case "user.deleted": {
      await userModel.findByIdAndDelete(data.id);
      return NextResponse.json({});
    }

    default: {
      return NextResponse.json({ error: "Unhandled event type" }, { status: 400 });
    }
  }
}
