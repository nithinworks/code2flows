"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { FiUpload, FiChevronUp } from "react-icons/fi";
import dynamic from "next/dynamic";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BackgroundGradient } from "./components/BackgroundGradient";
import { GridPattern } from "./components/GridPattern";
import "./animations.css";
import Script from "next/script";

// Dynamically import FlowchartViewer with loading fallback
const FlowchartViewer = dynamic(() => import("./components/FlowchartViewer"), {
  loading: () => (
    <div className="w-full overflow-auto bg-white p-4 rounded-lg min-h-[300px] flex flex-col items-center justify-center gap-3 border-2 border-[#001e2b]">
      <div className="w-8 h-8 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin"></div>
      <div className="text-[#001e2b]/60 text-sm">Loading viewer...</div>
    </div>
  ),
  ssr: false, // Disable server-side rendering for mermaid
});

export default function Home() {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [flowchartData, setFlowchartData] = useState<{
    executionSteps: string;
    mermaidChart: string;
    usageCount: number;
  } | null>(null);

  const [usageCount, setUsageCount] = useState<number>(0);
  const [hasCustomKeys, setHasCustomKeys] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  // Check for API keys on client side only
  useEffect(() => {
    const googleKey = localStorage.getItem("google_api_key");
    const mistralKey = localStorage.getItem("mistral_api_key");
    setHasCustomKeys(!!(googleKey || mistralKey));
  }, []);

  // Fetch initial usage count
  useEffect(() => {
    const fetchUsageCount = async () => {
      try {
        const response = await fetch("/api/usage");
        if (response.ok) {
          const data = await response.json();
          setUsageCount(data.usageCount);
        }
      } catch (error) {
        console.error("Failed to fetch usage count:", error);
      }
    };
    fetchUsageCount();
  }, []);

  // Update usage count when flowchart data changes
  useEffect(() => {
    if (flowchartData?.usageCount !== undefined) {
      setUsageCount(flowchartData.usageCount);
    }
  }, [flowchartData]);

  const allowedFileTypes = [
    ".txt",
    ".pdf",
    ".java",
    ".py",
    ".sql",
    ".js",
    ".cpp",
    ".ts",
    ".jsx",
    ".tsx",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");
    setFlowchartData(null);

    if (!file) return;

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      setError(
        "Invalid file type. Please upload a supported code or text file."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleCodeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(event.target.value);
    setFileName("code-input.txt");
    setFlowchartData(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      setError(
        "Invalid file type. Please upload a supported code or text file."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent) {
      setError("Please provide some code or upload a file.");
      return;
    }

    // Code validation
    const codeIndicators = [
      // Keywords that indicate code
      /(function|class|def|import|from|var|let|const|if|for|while)\s/,
      // Common syntax patterns
      /[{};()\[\]]/,
      // Assignments and operations
      /(\w+\s*=\s*|=>|->|\+=|-=|\*=|\/=)/,
      // Indentation patterns (common in Python)
      /^(\s{2,}|\t+)\w+/m,
      // Method/function calls
      /\w+\((.*?)\)/,
      // Comments
      /(\/\/|#|\/\*|\*\/|""")/,
    ];

    const isLikelyCode = codeIndicators.some((pattern) =>
      pattern.test(fileContent)
    );

    if (!isLikelyCode) {
      setError(
        "Please provide valid code. Natural language or plain text is not supported."
      );
      return;
    }

    setLoading(true);
    setError("");
    setLoadingStep("Analyzing code...");

    try {
      // Simulate code analysis step
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoadingStep("Processing diagram...");

      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: fileContent,
          fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process code");
      }

      const data = await response.json();
      setFlowchartData(data);

      // Scroll to result after a short delay
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process code");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Move the style to a separate component to avoid hydration issues
  const MermaidStyles = () => (
    <style jsx global>{`
      /* Hide only error-related elements while preserving diagram */
      .error-icon {
        display: none !important;
      }
      .error-text {
        display: none !important;
      }
      .error-message {
        display: none !important;
      }

      /* Handle error states */
      div[id^="dmermaid-"]:has(svg[role*="error"]) {
        display: none !important;
      }
      div[id^="dmermaid-"]:has(svg[aria-roledescription="error"]) {
        display: none !important;
      }

      /* Ensure diagram background is transparent */
      [id^="mermaid-"] {
        background: transparent !important;
      }
    `}</style>
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CodetoFlows",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Transform your code into beautiful, interactive flowcharts instantly with AI-powered visualization.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    featureList: [
      "AI-powered code analysis",
      "Multiple programming language support",
      "Interactive flowcharts",
      "Step-by-step execution explanation",
      "SVG export capability",
    ],
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <Script
        id="structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(structuredData)}
      </Script>
      <MermaidStyles />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <BackgroundGradient />
        <GridPattern />
      </div>

      <div className="h-full w-full flex flex-col md:items-center md:justify-center antialiased relative overflow-hidden">
        <Header />

        {/* Content */}
        <div className="relative z-10 w-full mt-16 md:mt-24 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
            {/* Announcement Banner */}
            <div className="bg-[#00ed64]/5 text-[#001e2b] px-4 md:px-5 py-2 rounded-md text-xs md:text-sm mb-8 md:mb-12 flex items-center gap-2 border border-[#00ed64]/20 animate-fade-in">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00ed64]"></span>
              New: Version 1.0 is now live with AI-powered flowcharts!
            </div>

            {/* Main Heading */}
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in stagger-1">
              <h1 className="text-[32px] md:text-[56px] leading-tight font-bold mb-3 md:mb-4 text-[#001e2b] font-bricolage">
                Code to Flowchart in seconds.
              </h1>
              <p className="text-lg md:text-xl text-[#001e2b]/60 font-medium">
                Transform your code into beautiful, interactive flowcharts
                instantly
              </p>
            </div>

            {/* Main Form Container */}
            <div className="w-full max-w-3xl mx-auto animate-scale-in stagger-2">
              <div className="bg-white p-4 md:p-8 rounded-lg border-2 border-[#001e2b] shadow-sm">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="space-y-4">
                    <div className="relative group">
                      <textarea
                        placeholder="Paste your code here..."
                        className={`w-full h-64 p-4 bg-white text-[#001e2b] rounded-md border-2 border-[#001e2b] focus:border-[#00ed64] focus:ring-1 focus:ring-[#00ed64] transition placeholder-[#001e2b]/30 ${
                          !hasCustomKeys && usageCount >= 50
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        value={fileContent}
                        onChange={handleCodeInput}
                        disabled={!hasCustomKeys && usageCount >= 50}
                      />
                      {!hasCustomKeys && usageCount >= 50 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-[#001e2b] text-sm text-[#001e2b]">
                            🎨 Daily limit reached! Add your API keys for
                            unlimited diagrams.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center w-full">
                      <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-[#001e2b] border-dashed rounded-md cursor-pointer hover:border-[#001e2b]/40 bg-[#001e2b]/5 transition group relative ${
                          isDragging ? "border-[#001e2b] bg-[#001e2b]/10" : ""
                        } ${
                          !hasCustomKeys && usageCount >= 50
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {isDragging ? (
                            <div className="text-4xl text-[#001e2b]/60 mb-3">
                              +
                            </div>
                          ) : (
                            <FiUpload className="w-8 h-8 mb-3 text-[#001e2b]/40 group-hover:text-[#001e2b]/60 transition-colors" />
                          )}
                          <p className="mb-2 text-sm text-[#001e2b]/60">
                            <span className="font-medium">Click to upload</span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-[#001e2b]/40">
                            Supported files: {allowedFileTypes.join(", ")}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept={allowedFileTypes.join(",")}
                          disabled={!hasCustomKeys && usageCount >= 50}
                        />
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm mt-2 bg-red-50 p-3 rounded-md border border-red-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || (!hasCustomKeys && usageCount >= 50)}
                    className={`w-full py-3 px-4 bg-[#00ed64] text-[#001e2b] font-semibold rounded-md border-2 border-[#001e2b] transition-all hover:bg-[#00ed64]/90 ${
                      loading || (!hasCustomKeys && usageCount >= 50)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin"></span>
                        <span>{loadingStep}</span>
                      </div>
                    ) : (
                      "Generate Flowchart"
                    )}
                  </button>

                  {/* Usage Counter Badge */}
                  <div className="mt-3 flex items-center justify-center gap-1.5">
                    <div className="bg-[#001e2b]/5 text-[#001e2b] px-2.5 py-0.5 rounded-full text-xs border border-[#001e2b]/10 flex items-center gap-1.5">
                      {hasCustomKeys ? (
                        <span>Unlimited diagrams (using custom API keys)</span>
                      ) : (
                        <>
                          <span>{50 - usageCount} diagrams left today</span>
                          <div className="h-3 w-[1px] bg-[#001e2b]/10"></div>
                          <span className="text-[#001e2b]/60">
                            Resets at midnight PT
                          </span>
                        </>
                      )}
                    </div>
                    <div className="group relative">
                      <button className="w-4 h-4 rounded-full border border-[#001e2b]/20 text-[#001e2b]/40 flex items-center justify-center text-xs hover:border-[#001e2b]/40 hover:text-[#001e2b]/60 transition-colors">
                        i
                      </button>
                      <div className="absolute bottom-full mb-2 right-0 w-60 p-2.5 bg-white rounded-lg shadow-lg border border-[#001e2b] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <p className="text-xs text-[#001e2b]/80">
                          {hasCustomKeys
                            ? "You're using your own API keys, so you have unlimited diagram generations."
                            : "We limit generations to 50 per day to ensure fair usage and maintain service quality for all users. Want unlimited generations? Add your own API keys."}
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {flowchartData && (
              <div
                ref={resultRef}
                className="mt-6 md:mt-8 w-full max-w-3xl animate-fade-in scroll-mt-24"
              >
                <Suspense
                  fallback={
                    <div className="bg-white p-4 md:p-8 rounded-lg border-2 border-[#001e2b] shadow-sm">
                      <div className="w-8 h-8 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  }
                >
                  <div className="bg-white p-4 md:p-8 rounded-lg border-2 border-[#001e2b] shadow-sm">
                    <h2 className="text-lg md:text-xl font-semibold text-[#001e2b] mb-4 font-bricolage">
                      Visualization
                    </h2>
                    <FlowchartViewer
                      chart={flowchartData.mermaidChart}
                      executionSteps={flowchartData.executionSteps}
                    />
                  </div>
                </Suspense>
              </div>
            )}
          </div>

          {/* Steps Explanation Section */}
          <div className="w-full mt-16 md:mt-32">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-center md:gap-16 gap-8 max-w-5xl mx-auto relative">
                {/* Connecting Lines - Only visible on md and up */}
                <div className="hidden md:block absolute top-6 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-[2px] bg-[#001e2b]/10" />

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-1">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    Describe what you
                    <br />
                    want to build.
                  </h3>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-2">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    Get a first version
                    <br />
                    in seconds.
                  </h3>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    Iterate & improve
                    <br />
                    with chat.
                  </h3>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-4">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    4
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    One-click to deploy
                    <br />
                    and share.
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="w-full mt-16 md:mt-32">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-16 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-[#001e2b] mb-4 font-bricolage">
                  A new era for product
                  <br className="hidden md:block" />
                  builders and developers.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
                {/* Product Teams */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-1 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Product teams
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Empower non-technical team members to code. Align on
                    abstract ideas by building real prototypes.
                  </p>
                </div>

                {/* Founders & Indie-hackers */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-2 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Founders, solopreneurs & indie-hackers
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Iterate and validate in minutes. Launch a full product in
                    less than a day.
                  </p>
                </div>

                {/* Product Designers */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-3 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Product designers
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Bring your design idea to life without tedious prototyping
                    work in tools like Figma.
                  </p>
                </div>

                {/* Software Engineers */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-4 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Human software engineers
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Ship an entire frontend in one prompt. Let Lovable fix bugs
                    and do your UI edits.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full mt-16 md:mt-32 flex justify-center">
            <div className="w-24 h-[2px] bg-[#001e2b]/10"></div>
          </div>

          {/* FAQ Section */}
          <div className="w-full mt-16 md:mt-32">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-[#001e2b] mb-8 md:mb-12 text-center font-bricolage">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {/* FAQ Item 1 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      What programming languages are supported?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      We support a wide range of languages including Python,
                      JavaScript, Java, TypeScript, SQL, C++, and more. Our AI
                      can analyze and visualize code from any text-based
                      programming language.
                    </p>
                  </div>

                  {/* FAQ Item 2 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      How accurate are the generated flowcharts?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      Our AI models (Google's Gemini and Mistral) are trained to
                      understand code structure and logic flow. The generated
                      flowcharts accurately represent the main execution paths
                      and logic of your code.
                    </p>
                  </div>

                  {/* FAQ Item 3 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      Can I customize the generated flowcharts?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      Yes! You can download the flowcharts as SVG files and
                      customize them using any vector graphics editor. The
                      flowcharts are also interactive, allowing you to toggle
                      between diagram and explanation views.
                    </p>
                  </div>

                  {/* FAQ Item 4 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      Is my code data secure?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      Absolutely. We process your code securely and don't store
                      any sensitive information. You can also use your own API
                      keys for added security and unlimited generations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full mt-16 md:mt-32 mb-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-[#001e2b] mb-6 font-bricolage">
                  Ready to transform your code into clear, visual flowcharts?
                </h2>
                <p className="text-lg md:text-xl text-[#001e2b]/60 mb-8">
                  Start generating beautiful flowcharts in seconds. No sign-up
                  required.
                </p>
                <button
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ed64] text-[#001e2b] font-semibold rounded-md border-2 border-[#001e2b] transition-all hover:bg-[#00ed64]/90"
                >
                  <FiChevronUp className="w-5 h-5" />
                  <span>Try it now</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
