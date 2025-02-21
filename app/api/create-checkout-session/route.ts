import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Add more detailed logging
console.log("Environment check:");
console.log("- STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log(
  "- STRIPE_PUBLISHABLE_KEY exists:",
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);
console.log("- BASE_URL exists:", !!process.env.NEXT_PUBLIC_BASE_URL);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  try {
    const { packId, userId } = await request.json();

    // Get credit pack details
    const creditPacks = {
      "basic-pack": { credits: 25, price: 499 }, // Price in cents
      "hobby-pack": { credits: 50, price: 999 },
      "premium-pack": { credits: 100, price: 1999 },
    };

    const pack = creditPacks[packId as keyof typeof creditPacks];
    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pack.credits} Credits`,
              description: "Credits for CodeToFlows diagram generation",
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/credits?canceled=true`,
      metadata: {
        userId,
        credits: pack.credits,
        packId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
