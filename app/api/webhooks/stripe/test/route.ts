import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("🎯 Test webhook received");
  return NextResponse.json({ received: true });
}
