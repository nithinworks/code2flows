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

// Credit package prices
const CREDIT_PRICES = {
  25: 4.99,
  50: 9.99,
  100: 19.99,
};

export async function GET() {
  try {
    // Get purchase transactions with user emails
    const { data: transactions, error } = await supabaseAdmin
      .from("credit_transactions")
      .select(
        `
        id,
        amount,
        type,
        created_at,
        user_id,
        users!inner(email)
      `
      )
      .eq("type", "purchase")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format transactions as payments
    const formattedPayments = transactions?.map((transaction) => ({
      id: transaction.id,
      user_email: transaction.users.email,
      credits: transaction.amount,
      amount:
        CREDIT_PRICES[transaction.amount as keyof typeof CREDIT_PRICES] || 0,
      status: "succeeded", // Since these are completed purchases
      created_at: transaction.created_at,
      payment_id: transaction.id, // Using transaction ID as payment ID
    }));

    // Calculate total revenue
    const totalRevenue = formattedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    return NextResponse.json({
      payments: formattedPayments || [],
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
