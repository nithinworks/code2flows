**Project: Code Visualization Tool**

### **Overview**

Develop a web-based tool where users can upload a single code file (any programming language) or a supported file type (TXT, PDF, JAVA, PY, SQL, etc.). The tool will process the file through AI models to generate a detailed mermaid.js flowchart visualizing the code execution flow.

### **Flow**

1. **File Upload**

   - Users can upload **only one file per request**.
   - Allowed file types: **Text files (.txt), PDF files (.pdf), and respective code files (.java, .py, .sql, .js, .cpp, etc.).**
   - **Restricted uploads:** Users **cannot** upload **folders, zip files, compressed files, or multiple files.**
   - Display a **clear message in the frontend** indicating these upload restrictions.

2. **Processing with AI Models**

   - Send the uploaded file’s content to **Google Gemini 2.0 Flash API** to summarize the code execution flow into steps.
   - Pass the received steps to **Mistral AI (Codestral-Latest Model)** to generate a **detailed and accurate mermaid.js flowchart**.
   - Ensure the diagram covers all execution paths and logic flow comprehensively.

3. **Frontend Display & User Interaction**

   - Display the generated **mermaid.js** flowchart in a visually appealing manner.
   - Provide options to:
     - **Export the diagram as SVG, PNG**
     - **Copy SVG/image for easy sharing**
   - Apply a **modern color scheme** to enhance readability and aesthetics.

4. **Tech Stack**

   - **Frontend:** Next.js (React Framework)
   - **Backend:** Node.js with API integrations for Gemini 2.0 & Mistral AI
   - **Storage & Limits:** Supabase for tracking the number of diagrams generated

5. **Usage Limits**

   - Limit of **50 diagrams site-wide per day** due to API budget constraints.
   - The limit resets **every day at midnight (12 AM UTC)**.
   - Supabase will be used to track the number of generated diagrams.

6. **API Integration Snippets**
   - **Google Gemini API:**
     ```javascript
     const { GoogleGenerativeAI } = require("@google/generative-ai");
     const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
     const result = await model.generateContent(prompt);
     console.log(result.response.text());
     ```
   - **Mistral AI API:**
     ```javascript
     import { Mistral } from "@mistralai/mistralai";
     const apiKey = process.env.MISTRAL_API_KEY;
     const client = new Mistral({ apiKey: apiKey });
     const chatResponse = await client.chat.complete({
       model: "codestral-latest",
       messages: [
         { role: "user", content: "Summarized steps of the code flow" },
       ],
     });
     console.log("Chat:", chatResponse.choices[0].message.content);
     ```
   - **Frontend Rendering:**
     - Use **mermaid.js** in the frontend to render the flowchart.
     - Ensure it runs efficiently and is visually enhanced with themes and colors.
     - Display an **error message for unsupported file uploads**.

### **Expected Output**

- A Next.js-based web app that allows users to upload a **single** code file and receive a **visual flowchart of the code execution**.
- The flowchart should be **accurate, detailed, and visually appealing**.
- **Export & copy options** for the generated diagram (SVG, PNG).
- A system to **track diagram generation limits** using Supabase.
