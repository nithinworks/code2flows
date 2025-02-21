import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCodeCache(code: string, type: string) {
  try {
    console.log("Checking cache for:", { code: code.slice(0, 50), type });

    // Create a cache key by hashing the code and type
    const cacheKey = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(code + type)
    );
    const cacheKeyHex = Array.from(new Uint8Array(cacheKey))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { data, error } = await supabase
      .from("code_cache")
      .select("*")
      .eq("cache_key", cacheKeyHex)
      .single();

    if (error) {
      console.error("Cache fetch error:", error);
      return null;
    }

    console.log("Cache hit:", !!data);
    return data;
  } catch (error) {
    console.error("Error getting code cache:", error);
    return null;
  }
}

export async function saveToCodeCache(
  code: string,
  type: string,
  executionSteps: string,
  mermaidChart: string
) {
  try {
    console.log("Saving to cache:", { code: code.slice(0, 50), type });

    // Create the same cache key for consistency
    const cacheKey = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(code + type)
    );
    const cacheKeyHex = Array.from(new Uint8Array(cacheKey))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error } = await supabase.from("code_cache").insert({
      cache_key: cacheKeyHex,
      code,
      type,
      execution_steps: executionSteps,
      mermaid_chart: mermaidChart,
    });

    if (error) {
      console.error("Cache save error:", error);
    } else {
      console.log("Successfully saved to cache");
    }
  } catch (error) {
    console.error("Error saving to code cache:", error);
  }
}
