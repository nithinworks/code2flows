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

export async function GET() {
  try {
    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact" });

    // Get active users (not banned)
    const { count: activeUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact" })
      .eq("status", "active");

    // Get credits stats
    const { data: creditsData } = await supabaseAdmin
      .from("credit_transactions")
      .select("type, amount");

    const totalCreditsIssued = creditsData
      ?.filter((t) => t.type !== "usage")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCreditsUsed = creditsData
      ?.filter((t) => t.type === "usage")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get recent transactions with user emails
    const { data: transactions } = await supabaseAdmin
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
      .order("created_at", { ascending: false })
      .limit(50);

    // Format transactions
    const formattedTransactions = transactions?.map((t) => ({
      id: t.id,
      user_id: t.user_id,
      user_email: t.users.email,
      amount: t.amount,
      type: t.type,
      created_at: t.created_at,
    }));

    return NextResponse.json({
      analytics: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalCreditsIssued: totalCreditsIssued || 0,
        totalCreditsUsed: totalCreditsUsed || 0,
      },
      transactions: formattedTransactions || [],
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
