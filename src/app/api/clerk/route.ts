import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { ClerkWebhookEvent } from "@/types/clerkWebhooks";
import connectDB from "@/config/db";
import userModel from "@/models/userModel";

const SECRET_KEY = process.env.CLERK_SECRET_KEY as string;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Step 1: Validate incoming webhook
    const signature = req.headers["clerk-signature"] as string;
    const body = req.body;
    const isValid = verifyClerkWebhook(signature, body);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature." });
    }

    // Step 2: Handle each event type
    const event: ClerkWebhookEvent = req.body;

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await handleUserCreatedOrUpdated(event);
        break;

      case "user.deleted":
        await handleUserDeleted(event);
        break;

      default:
        return res.status(200).json({ message: "Event not handled." });
    }

    // Step 3: Return success response
    return res.status(200).json({ message: "Event processed successfully." });
  } catch (error) {
    console.error("Error handling Clerk webhook:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyClerkWebhook = (signature: string, body: any) => {
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(JSON.stringify(body))
    .digest("hex");

  return signature === expectedSignature;
};

// Handler for "user.created" and "user.updated"
const handleUserCreatedOrUpdated = async (event: ClerkWebhookEvent) => {
  await connectDB();

  // Extract user data
  const { id, email_addresses, first_name, last_name, image_url } = event.data;

  await userModel.findByIdAndUpdate(
    id,
    {
      email: email_addresses[0]?.email_address ?? "",
      name: `${first_name ?? ""} ${last_name ?? ""}`,
      image: image_url ?? "",
    },
    { upsert: true, new: true }
  );
};

// Handler for "user.deleted"
const handleUserDeleted = async (event: ClerkWebhookEvent) => {
  await connectDB();

  const { id } = event.data;

  await userModel.findByIdAndDelete(id);
};

export default handler;
