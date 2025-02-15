import { NextResponse } from "next/server";
import { getTodaysDiagramCount } from "@/lib/supabase";

export async function GET() {
  try {
    const todayCount = await getTodaysDiagramCount();
    return NextResponse.json({
      usageCount: todayCount,
    });
  } catch (error) {
    console.error("Error fetching usage count:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage count" },
      { status: 500 }
    );
  }
}
