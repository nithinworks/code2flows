import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

// Create a service role client
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
    const { sessionId } = await request.json();
    console.log("🔍 Verifying session:", sessionId);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("💳 Session status:", session.payment_status);

    if (session.payment_status === "paid") {
      const { userId, credits } = session.metadata!;
      const amount = session.amount_total;

      // Use supabaseAdmin instead of supabase
      const { data: updateData, error: txnError } = await supabaseAdmin.rpc(
        "update_user_credits",
        {
          p_user_id: userId,
          p_credits: Number(credits),
        }
      );

      if (txnError) {
        console.error("❌ Credits update failed:", txnError);
        throw txnError;
      }

      console.log("✅ Credits updated:", updateData);

      // Get updated user data - wait a moment for DB to sync
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use supabaseAdmin here as well
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("credits, email")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("❌ Failed to fetch updated credits:", fetchError);
        throw fetchError;
      }

      console.log("👤 New user credits:", userData.credits);

      // Send confirmation email
      const { error: emailError } = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            credits: Number(credits),
            amount: amount,
          }),
        }
      ).then((res) => res.json());

      if (emailError) {
        console.error("❌ Failed to send email:", emailError);
      }

      return NextResponse.json({
        success: true,
        credits: userData.credits,
      });
    }

    return NextResponse.json({ error: "Payment incomplete" }, { status: 400 });
  } catch (error) {
    console.error("❌ Verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }
}
