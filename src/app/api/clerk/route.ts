import { Webhook } from "svix";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ClerkUser {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
  image_url?: string;
}

interface ClerkEvent {
  data: ClerkUser;
  type: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const signinSecret = process.env.SIGNIN_SECRET;
  if (!signinSecret) throw new Error("signinSecret is not defined in dotenv");

    // Create new Svix instance with secret
    const wh = new Webhook(signinSecret)

    const headerPayload = await headers()
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id") ?? "",
      "svix-signature": headerPayload.get("svix-signature") ?? ""
    };
    
    // Get The payload and verify it
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders) as ClerkEvent

    // Prepare the user data to be saved in the database
    const  userData = {
      _id: data.id, 
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      image: data.image_url
    };

    await connectDB();

    switch (type) {
      case "user.created": 
        await userModel.create(userData);
        break;
      
      case "user.updated": 
        await userModel.findByIdAndUpdate(data.id, userData);
        break;

      case "user.deleted": 
        await userModel.findByIdAndDelete(data.id);
        break;

      default:
        break;
    }

    return NextResponse.json({ message: "Event received" })
};

