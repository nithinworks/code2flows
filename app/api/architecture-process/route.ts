import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCodeCache, saveToCodeCache } from "@/lib/supabase";

// Initialize Supabase client
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
  console.log("Original chart:", chart);

  // First clean up markdown code blocks and whitespace
  let cleanedChart = chart
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Always ensure flowchart TD is at the start
  if (!cleanedChart.startsWith("flowchart TD")) {
    cleanedChart = `flowchart TD\n${cleanedChart}`;
  }

  // Process the chart line by line
  const lines = cleanedChart.split("\n");
  const processedLines = lines.map((line) => {
    // Handle subgraph lines
    if (line.trim().startsWith("subgraph")) {
      // Remove extra quotes from subgraph names
      const name = line
        .trim()
        .replace("subgraph", "")
        .replace(/"+/g, "") // Remove all double quotes
        .trim();
      return `subgraph "${name}"`;
    }
    // Handle node definitions
    if (line.includes("[")) {
      return line.replace(/\[(.*?)\]/g, (match, content) => {
        // Clean up node content
        content = content
          .replace(/"+/g, "") // Remove all double quotes
          .replace(/'/g, "") // Remove single quotes
          .trim();
        return `["${content}"]`;
      });
    }
    // Handle arrows
    if (line.includes("-->") || line.includes("==>") || line.includes("-.->")) {
      return line
        .replace(/==>/g, "-->")
        .replace(/-\.->|==>/g, "-->")
        .replace(/\s*-->\s*/g, " --> ")
        .trim();
    }
    return line.trim();
  });

  // Join lines and clean up
  cleanedChart = processedLines
    .filter((line) => line.trim()) // Remove empty lines
    .join("\n")
    .trim();

  console.log("Final cleaned chart:", cleanedChart);
  return cleanedChart;
}

// Clean analysis text
function cleanAnalysis(analysis: string): string {
  return analysis
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
    const { description } = await request.json();

    // Get user session from request
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Please sign in to generate architecture diagrams" },
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

    // Get user credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Failed to fetch user credits" },
        { status: 500 }
      );
    }

    if (userData.credits <= 0) {
      return NextResponse.json(
        { error: "No credits remaining. Please purchase more credits." },
        { status: 403 }
      );
    }

    // Check cache
    const cachedResult = await getCodeCache(description, "architecture");
    if (cachedResult) {
      // Deduct credit for cached result
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userData.credits - 1 })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update credits" },
          { status: 500 }
        );
      }

      // Record the transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        amount: -1,
        type: "usage",
      });

      return NextResponse.json({
        analysis: cachedResult.execution_steps,
        mermaidChart: cachedResult.mermaid_chart,
        usageCount: userData.credits - 1,
        cached: true,
      });
    }

    // Deduct credit before processing
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: userData.credits - 1 })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 }
      );
    }

    // Record the transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -1,
      type: "usage",
    });

    // Step 1: Use Gemini to analyze project and create structured analysis
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const geminiPrompt = `You are a software architect. Analyze this project description and provide a detailed architecture analysis. If the input is unclear or insufficient, respond with "INVALID_DESCRIPTION".

For valid descriptions:
1. Identify core components and their purposes
2. Analyze technology stack and frameworks
3. Describe data flow and interactions
4. List external integrations
5. Note infrastructure requirements
6. Identify potential scalability considerations

Format the response in clear sections with headings.

Project Description:

${description}`;

    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const analysis = cleanAnalysis(geminiResult.response.text());

    // Check if Gemini detected invalid description
    if (analysis.includes("INVALID_DESCRIPTION")) {
      return NextResponse.json(
        {
          error: "Please provide a more detailed project description.",
        },
        { status: 400 }
      );
    }

    // Step 2: Use Mistral to convert analysis into mermaid.js flowchart
    const mistralPrompt = `Convert this architecture analysis into a mermaid.js flowchart diagram. Start with exactly "flowchart TD" and follow this format:

flowchart TD
    subgraph "Frontend"
        client["fa:fa-desktop Client App"]
    end
    subgraph "Backend"
        api["fa:fa-api API Service"]
        db["fa:fa-database Database"]
    end
    client --> api
    api --> db

Rules:
1. MUST start with "flowchart TD"
2. Each subgraph must be in quotes: subgraph "Name"
3. Each node must be in quotes: nodeId["label"]
4. Use only --> for connections
5. Use these icons:
   - fa:fa-desktop for UI/frontend
   - fa:fa-api for APIs
   - fa:fa-server for services
   - fa:fa-database for databases
   - fa:fa-cloud for cloud services
   - fa:fa-lock for security
   - fa:fa-cube for containers

Convert this analysis to a flowchart:

${analysis}

Remember to start with "flowchart TD" on the first line.`;

    const mistralResponse = await mistralClient.chat.complete({
      model: "codestral-latest",
      messages: [{ role: "user", content: mistralPrompt }],
    });

    const content = mistralResponse.choices?.[0]?.message?.content;
    if (!content || Array.isArray(content)) {
      throw new Error("Failed to generate architecture diagram");
    }

    const mermaidChart = cleanMermaidChart(content);

    // Save to cache
    await saveToCodeCache(description, "architecture", analysis, mermaidChart);

    return NextResponse.json({
      analysis,
      mermaidChart,
      usageCount: userData.credits - 1,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Failed to process the description. Please try again." },
      { status: 500 }
    );
  }
}
