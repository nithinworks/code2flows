import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database tables
export interface DiagramCount {
  id: number;
  date: string;
  count: number;
  created_at: string;
}

export interface CodeCache {
  id: number;
  code: string;
  file_name: string;
  execution_steps: string;
  mermaid_chart: string;
  created_at: string;
}

// Function to get today's diagram count
export async function getTodaysDiagramCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("diagram_counts")
    .select("count")
    .eq("date", today)
    .single();

  if (error) {
    console.error("Error getting diagram count:", error);
    return 0;
  }

  return data?.count || 0;
}

// Function to increment today's diagram count
export async function incrementDiagramCount(): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  // First, try to update existing record
  const { data: existingData, error: selectError } = await supabase
    .from("diagram_counts")
    .select("count")
    .eq("date", today)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 is "not found" error
    console.error("Error checking diagram count:", selectError);
    return false;
  }

  if (existingData) {
    const newCount = existingData.count + 1;
    if (newCount > 50) return false; // Limit reached

    const { error: updateError } = await supabase
      .from("diagram_counts")
      .update({ count: newCount })
      .eq("date", today);

    if (updateError) {
      console.error("Error updating diagram count:", updateError);
      return false;
    }
  } else {
    // Create new record for today
    const { error: insertError } = await supabase
      .from("diagram_counts")
      .insert([{ date: today, count: 1 }]);

    if (insertError) {
      console.error("Error inserting diagram count:", insertError);
      return false;
    }
  }

  return true;
}

// Function to check code cache
export async function getCodeCache(
  code: string,
  fileName: string
): Promise<CodeCache | null> {
  const { data, error } = await supabase
    .from("code_cache")
    .select("*")
    .eq("code", code)
    .eq("file_name", fileName)
    .single();

  if (error) {
    console.error("Error checking code cache:", error);
    return null;
  }

  return data;
}

// Function to save to code cache
export async function saveToCodeCache(
  code: string,
  fileName: string,
  executionSteps: string,
  mermaidChart: string
): Promise<boolean> {
  const { error } = await supabase.from("code_cache").insert([
    {
      code,
      file_name: fileName,
      execution_steps: executionSteps,
      mermaid_chart: mermaidChart,
    },
  ]);

  if (error) {
    console.error("Error saving to code cache:", error);
    return false;
  }

  return true;
}
