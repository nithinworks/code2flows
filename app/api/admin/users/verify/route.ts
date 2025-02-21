import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { userId, adminId } = await request.json();

    // Update user verification status
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        email_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Log the admin action
    const { error: logError } = await supabaseAdmin.from("admin_logs").insert({
      admin_id: adminId,
      action_type: "verify_user",
      target_user_id: userId,
      details: { action: "email_verification" },
    });

    if (logError) throw logError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { error: "Failed to verify user" },
      { status: 500 }
    );
  }
}
