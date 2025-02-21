// Similar to process/route.ts but adapted for ER diagrams
// I'll provide this in the next message

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getTodaysDiagramCount,
  incrementDiagramCount,
  getCodeCache,
  saveToCodeCache,
} from "@/lib/supabase";

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize AI clients with default keys only
const googleKey = process.env.GOOGLE_API_KEY || "";
const mistralKey = process.env.MISTRAL_API_KEY || "";

// Clean mermaid chart string
function cleanMermaidChart(chart: string): string {
  return chart
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^erDiagram\n?/g, "")
    .replace(/\s*\n\s*/g, "\n")
    .split(/\n/)
    .filter((line) => line.trim())
    .join("\n")
    .trim();
}

// Clean entity relations
function cleanEntityRelations(relations: string): string {
  return relations
    .replace(/[#*`]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Initialize AI clients
const genAI = new GoogleGenerativeAI(googleKey);
const mistralClient = new Mistral({
  apiKey: mistralKey,
});

export async function POST(request: Request) {
  try {
    const { queries } = await request.json();

    // Get user session from request
    const authHeader = request.headers.get("authorization");
    console.log("Auth Header:", authHeader);

    let userId = null;
    let userCredits = null;
    let creditDeducted = false;

    // Check for authentication
    if (!authHeader) {
      return NextResponse.json(
        { error: "Please sign in to generate ER diagrams" },
        { status: 401 }
      );
    }

    // Verify user and check credits
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    userId = user.id;
    console.log("User ID:", userId);

    // Get user credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    console.log("User Data:", userData);
    console.log("User Error:", userError);

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Failed to fetch user credits" },
        { status: 500 }
      );
    }

    userCredits = userData.credits;
    console.log("Current Credits:", userCredits);

    if (userCredits <= 0) {
      return NextResponse.json(
        { error: "No credits remaining. Please purchase more credits." },
        { status: 403 }
      );
    }

    // Check cache
    const cachedResult = await getCodeCache(queries, "er-diagram");
    if (cachedResult) {
      // Deduct credit for cached result
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userCredits - 1 })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating credits for cached result:", updateError);
        return NextResponse.json(
          { error: "Failed to update credits" },
          { status: 500 }
        );
      }

      // Record the transaction
      await supabase.from("credit_transactions").insert({
        user_id: userId,
        amount: -1,
        type: "usage",
      });

      return NextResponse.json({
        mermaidChart: cachedResult.mermaid_chart,
        entityRelations: cachedResult.execution_steps,
        usageCount: userCredits - 1,
        cached: true,
      });
    }

    // Deduct credit before processing
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: userCredits - 1 })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      );
    }

    // Record the transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -1,
      type: "usage",
    });

    // Your existing ER diagram generation code...
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const geminiPrompt = `You are a database expert. Analyze these SQL CREATE TABLE queries and explain the entity relationships. If this input is not valid SQL, respond with "INVALID_SQL".

For valid SQL:
1. List each table and its primary key
2. List foreign key relationships between tables
3. Describe the type of relationships (one-to-one, one-to-many, many-to-many)
4. Note any indexes or constraints
5. List important columns and their data types

Format the response in clear sections with headings.

SQL Queries to analyze:

${queries}`;

    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const entityRelations = cleanEntityRelations(geminiResult.response.text());

    // Check if Gemini detected invalid SQL
    if (entityRelations.includes("INVALID_SQL")) {
      return NextResponse.json(
        {
          error: "Please provide valid SQL CREATE TABLE queries.",
        },
        { status: 400 }
      );
    }

    // Step 2: Use Mistral to convert analysis into mermaid.js ER diagram
    const mistralPrompt = `Convert this database analysis into a mermaid.js ER diagram. Follow these requirements exactly:

1. Start with "erDiagram"
2. First list all relationships, one per line
3. Then list all entities with their attributes
4. Use these exact relationship types:
   - ||--o{ for one-to-many
   - }o--o{ for many-to-many
   - ||--|| for one-to-one
5. Format:
   - Relationships: ENTITY1 ||--o{ ENTITY2 : "describes"
   - Entities: 
     ENTITY {
       type field PK "Primary Key"
       type field FK "Foreign Key"
       type field
     }

Example:
erDiagram
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"

    CUSTOMER {
        string id PK "Primary Key"
        string name
        string email
    }
    ORDER {
        int id PK "Primary Key"
        string customer_id FK "References Customer"
        datetime created_at
    }
    ORDER_ITEM {
        int id PK "Primary Key"
        int order_id FK "References Order"
        int quantity
    }

Rules:
- List all relationships first, then entities
- Use underscores for multi-word names
- Each relationship on its own line
- Each entity on its own line with proper indentation
- No special characters in names
- No styling or class definitions

Convert this analysis to ER diagram:

${entityRelations}

Output only the mermaid.js code, nothing else.`;

    const mistralResponse = await mistralClient.chat.complete({
      model: "codestral-latest",
      messages: [{ role: "user", content: mistralPrompt }],
    });

    const content = mistralResponse.choices?.[0]?.message?.content;
    if (!content || Array.isArray(content)) {
      throw new Error("Failed to generate ER diagram");
    }

    const mermaidChart = cleanMermaidChart(content);

    // Save to cache
    await saveToCodeCache(queries, "er-diagram", entityRelations, mermaidChart);

    console.log("Received SQL queries:", queries);
    console.log("Generated mermaid chart:", mermaidChart);
    console.log("Generated entity relations:", entityRelations);

    return NextResponse.json({
      mermaidChart,
      entityRelations,
      usageCount: userData.credits - 1,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Failed to process SQL. Please try again." },
      { status: 500 }
    );
  }
}
