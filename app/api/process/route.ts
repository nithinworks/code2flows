import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from "next/server";
import {
  getTodaysDiagramCount,
  incrementDiagramCount,
  getCodeCache,
  saveToCodeCache,
} from "@/lib/supabase";
import { cookies } from "next/headers";

// Initialize AI clients with default keys
const defaultGoogleKey = process.env.GOOGLE_API_KEY || "";
const defaultMistralKey = process.env.MISTRAL_API_KEY || "";

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
    const { code, fileName, googleApiKey, mistralApiKey } =
      await request.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Use custom API keys if provided, otherwise use default keys
    const googleKey = googleApiKey || defaultGoogleKey;
    const mistralKey = mistralApiKey || defaultMistralKey;

    // Only check daily limit if using default keys
    if (!googleApiKey && !mistralApiKey) {
      const todayCount = await getTodaysDiagramCount();
      if (todayCount >= 50) {
        return NextResponse.json(
          {
            error:
              "Daily diagram limit reached. Please try again tomorrow or add your own API keys.",
          },
          { status: 429 }
        );
      }
    }

    // Check cache first
    const cachedResult = await getCodeCache(code, fileName);
    if (cachedResult) {
      // Only increment count if using default keys
      if (!googleApiKey && !mistralApiKey) {
        await incrementDiagramCount();
        const remainingCount = 50 - (await getTodaysDiagramCount());
        return NextResponse.json({
          executionSteps: cachedResult.execution_steps,
          mermaidChart: cachedResult.mermaid_chart,
          usageCount: 50 - remainingCount,
          cached: true,
        });
      } else {
        return NextResponse.json({
          executionSteps: cachedResult.execution_steps,
          mermaidChart: cachedResult.mermaid_chart,
          usageCount: 0,
          cached: true,
          unlimited: true,
        });
      }
    }

    // Initialize AI clients with appropriate keys
    const genAI = new GoogleGenerativeAI(googleKey);
    const mistralClient = new Mistral({
      apiKey: mistralKey,
    });

    // Step 1: Use Gemini to analyze code and create execution steps
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
6. No special characters in node text

Example of correct format:
A[[Start]]
A --> B[(Create Database)]
B --> C([Process Data])
C --> D{Check Status}
D -->|Yes| E([Continue])
D -->|No| F([Stop])
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
    await saveToCodeCache(code, fileName, executionSteps, mermaidChart);

    // Increment diagram count
    const success = await incrementDiagramCount();
    if (!success) {
      return NextResponse.json(
        { error: "Failed to track diagram generation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      executionSteps,
      mermaidChart,
      usageCount: 50 - (await getTodaysDiagramCount()),
      cached: false,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      {
        error:
          "Oops! This doesn't look like code. Try pasting in some actual code (you know, the stuff with functions, loops, and all that fun syntax). We're better at flowcharting code than poetry! 🎨",
      },
      { status: 500 }
    );
  }
}
