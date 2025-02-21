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

// Initialize AI clients
const genAI = new GoogleGenerativeAI(googleKey);
const mistralClient = new Mistral({
  apiKey: mistralKey,
});

// Clean mermaid chart string by removing markdown code blocks and extra whitespace
function cleanMermaidChart(chart: string): string {
  return chart
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .replace(/^flowchart TD\n?/g, "")
    .replace(/^graph TD\n?/g, "")
    .replace(/["']/g, "") // Remove quotes
    .replace(/\s*\n\s*/g, "\n") // Normalize line breaks
    .replace(/(\w)\s*-->\s*(\w)/g, "$1 --> $2") // Normalize arrows
    .split(/\n/)
    .filter((line) => line.trim())
    .join("\n")
    .trim();
}

// Clean execution steps by removing markdown formatting
function cleanExecutionSteps(steps: string): string {
  return steps
    .replace(/[#*`]/g, "") // Remove markdown formatting
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
    .trim();
}

export async function POST(request: Request) {
  try {
    const { code, fileName } = await request.json();

    // Get user session from request
    const authHeader = request.headers.get("authorization");
    console.log("Auth Header:", authHeader);

    let userId = null;
    let userCredits = null;
    let creditDeducted = false;

    // Check for authentication
    if (!authHeader) {
      return NextResponse.json(
        { error: "Please sign in to generate flowcharts" },
        { status: 401 }
      );
    }

    // Verify user and check credits
    try {
      const token = authHeader.replace("Bearer ", "");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (userError || !user) {
        throw new Error("Invalid user token");
      }

      userId = user.id;

      // Get user credits
      const { data: userData, error: creditError } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (creditError) {
        throw new Error("Failed to fetch user credits");
      }

      userCredits = userData.credits;

      if (userCredits < 1) {
        return NextResponse.json(
          { error: "Insufficient credits. Please purchase more credits." },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Check cache first
    const cachedResult = await getCodeCache(code, "flowchart");
    if (cachedResult) {
      // Deduct credit for cached result
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userCredits - 1 })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update credits:", updateError);
      } else {
        creditDeducted = true;
      }

      return NextResponse.json({
        mermaidChart: cachedResult.mermaid_chart,
        executionSteps: cachedResult.execution_steps,
        usageCount: userCredits - 1,
      });
    }

    // Process with AI
    const geminiModel = new GoogleGenerativeAI(googleKey).getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const mistralClient = new Mistral({
      apiKey: mistralKey,
    });

    // Basic code validation
    const codeLines = code.trim().split("\n");
    if (
      codeLines.length < 2 ||
      !code.match(/[(){};=]|function|class|def|if|for|while/)
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide valid code. Natural language or plain text is not supported.",
        },
        { status: 400 }
      );
    }

    const geminiPrompt = `You are a code analysis expert. Your task is to analyze the following code and explain its execution flow. If this input is not valid code, respond with "INVALID_CODE".

When explaining valid code:
- Start each step with "The code" or "Then it" or similar natural phrases
- Use present tense to describe what each part does
- Keep it conversational and easy to understand
- Focus on explaining the main logic flow
- Avoid technical jargon unless necessary
- Number each step for clarity

Example style:
1. The code begins by setting up the initial configuration
2. Then it loads the necessary data from storage
3. Next, it processes each item in the collection
4. Finally, it saves the results back to storage

Here's the code to analyze:

${code}`;

    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const executionSteps = cleanExecutionSteps(geminiResult.response.text());

    // Check if Gemini detected invalid code
    if (executionSteps.includes("INVALID_CODE")) {
      return NextResponse.json(
        {
          error:
            "Please provide valid code. Natural language or plain text is not supported.",
        },
        { status: 400 }
      );
    }

    // Step 2: Use Mistral to convert steps into mermaid.js flowchart
    const mistralPrompt = `Convert these code execution steps into a mermaid.js flowchart. Follow these requirements exactly:

1. Use simple node IDs (A, B, C, etc.)
2. Use appropriate shapes based on the operation:
   - Database operations (create/insert/select): Use cylinder shape [(Text)]
   - Process/Action (calculations/transformations): Use stadium shape ([Text])
   - Decision/Condition: Use diamond shape {Text}
   - Start/End: Use rounded rectangle [[Text]]
3. Keep node text concise (max 4-5 words)
4. Use only --> for connections
5. Each node and connection must be on its own line
6. Format programming concepts as words:
   - Instead of array[]: use "array of"
   - Instead of function(): use "function"
   - Instead of object.property: use "object property"
   - Instead of map<key,value>: use "map of"
   - Instead of array.push(): use "add to array"
7. No special characters allowed in node text:
   - No brackets [], (), {}, <>
   - No dots or periods
   - No quotation marks
   - No mathematical symbols
   - No programming operators

Example of correct format:
A[[Start]]
A --> B[(Create Database)]
B --> C([Process Array of Items])
C --> D{Check Status}
D -->|Yes| E([Call User Function])
D -->|No| F([Get Object Property])
F --> Z[[End]]

Rules for this specific flowchart:
- First node must be A[[Start]]
- Last node must be Z[[End]]
- Database operations (create/insert/select) must use [(Text)]
- Other operations must use ([Text])
- Each line must contain either a node definition or a single connection
- No styling or class definitions in the output

Convert these steps to flowchart:

${executionSteps}

Remember: Only output the node definitions and connections, nothing else.`;

    const mistralResponse = await mistralClient.chat.complete({
      model: "codestral-latest",
      messages: [{ role: "user", content: mistralPrompt }],
    });

    const content = mistralResponse.choices?.[0]?.message?.content;
    if (!content || Array.isArray(content)) {
      throw new Error("Failed to generate flowchart");
    }

    const mermaidChart = cleanMermaidChart(content);

    // Save to cache
    await saveToCodeCache(code, "flowchart", executionSteps, mermaidChart);

    // Deduct credit after successful generation
    if (!creditDeducted) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: userCredits - 1 })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update credits:", updateError);
      }
    }

    // Record the transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: -1,
      type: "usage",
    });

    return NextResponse.json({
      mermaidChart,
      executionSteps,
      usageCount: userCredits - 1,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Failed to process code. Please try again." },
      { status: 500 }
    );
  }
}
