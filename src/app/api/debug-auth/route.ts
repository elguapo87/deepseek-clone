import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  console.log("DEBUG AUTH:", auth); // See what's returned

  return NextResponse.json({ auth });
}