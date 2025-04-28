import { Webhook } from "svix";
import connectDB from "../../../config/db";
import userModel from "../../../models/userModel";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req) {
    const wh = new Webhook(process.env.SIGNIN_SECRET);
    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email.address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
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

    return NextRequest.json({ message: "Event received" });
};