import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  console.log("💡 Starting webhook processing");

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ No stripe signature found");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  try {
    console.log("🔍 Verifying Stripe signature");
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.metadata) {
        throw new Error("No metadata in session");
      }

      const { userId, credits } = session.metadata;
      console.log("📦 Processing payment:", { userId, credits });

      // Start transaction
      const { data, error: txnError } = await supabase.rpc(
        "update_user_credits",
        {
          p_user_id: userId,
          p_credits: Number(credits),
        }
      );

      if (txnError) {
        console.error("❌ Transaction failed:", txnError);
        throw txnError;
      }

      console.log("✅ Credits updated:", data);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
