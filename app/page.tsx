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
import { useAuth } from "@/lib/context/auth";
import { supabase } from "@/lib/supabase";
import AuthModal from "./components/AuthModal";
import { toast } from "react-hot-toast";

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
  const { user, refreshCredits, checkEmailVerified } = useAuth();
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [flowchartData, setFlowchartData] = useState<{
    executionSteps: string;
    mermaidChart: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

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
      setError("Please provide some code to analyze.");
      return;
    }
    try {
      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }

      if (!checkEmailVerified()) {
        return;
      }

      setLoading(true);
      setError("");
      setLoadingStep("Analyzing code...");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          code: fileContent,
          fileName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process code");
      }

      if (user?.id) {
        await refreshCredits();
      }

      setFlowchartData(data);
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to process code"
      );
      return;
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
              Completely Free – No Signup Required!
            </div>

            {/* Main Heading */}
            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 animate-fade-in stagger-1">
              <h1 className="text-[32px] md:text-[50px] leading-tight font-bold mb-3 md:mb-4 text-[#001e2b] font-bricolage">
                Code to Flowchart in seconds.
              </h1>
              <p className="text-lg md:text-m text-[#001e2b]/60 font-medium">
                Understanding code has never been easier! Transform your code
                into interactive, beautifully structured flowcharts in just a
                click
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
                        className="w-full h-64 p-4 bg-white text-[#001e2b] rounded-md border-2 border-[#001e2b] focus:border-[#00ed64] focus:ring-1 focus:ring-[#00ed64] transition placeholder-[#001e2b]/30"
                        value={fileContent}
                        onChange={handleCodeInput}
                      />
                    </div>

                    <div className="flex items-center justify-center w-full">
                      <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-[#001e2b] border-dashed rounded-md cursor-pointer hover:border-[#001e2b]/40 bg-[#001e2b]/5 transition group relative ${
                          isDragging ? "border-[#001e2b] bg-[#001e2b]/10" : ""
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
                    disabled={loading}
                    className={`w-full py-3 px-4 bg-[#00ed64] text-[#001e2b] font-semibold rounded-md border-2 border-[#001e2b] transition-all hover:bg-[#00ed64]/90 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="w-4 h-4 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin"></span>
                        <span>{loadingStep}</span>
                      </div>
                    ) : user ? (
                      "Generate Flowchart"
                    ) : (
                      "Sign in to Generate"
                    )}
                  </button>
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
                    Paste or Upload
                    <br />
                    your code.
                  </h3>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-2">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    AI analyzes and
                    <br />
                    generates flowchart.
                  </h3>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    3
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    Understand
                    <br />
                    your code visually.
                  </h3>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full md:w-1/4 animate-fade-in stagger-4">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-xl font-semibold text-[#001e2b] font-bricolage border-2 border-[#001e2b]/10">
                    4
                  </div>
                  <h3 className="text-lg font-semibold text-[#001e2b] font-bricolage">
                    Export and share
                    <br />
                    with your mates.
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
                  Who Can Benefit from
                  <br className="hidden md:block" />
                  CodetoFlows?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
                {/* Product Teams */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-1 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Learn & Understand Code
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Break down complex logic into clear, step-by-step flowcharts
                    to improve comprehension and learning.
                  </p>
                </div>

                {/* Founders & Indie-hackers */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-2 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Review & Refactor Code
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Analyze execution flow to simplify, clean up, and improve
                    the efficiency of your code.
                  </p>
                </div>

                {/* Product Designers */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-3 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Document Code Effortlessly
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Bring your design idea to life without tedious prototyping
                    work in tools like Figma.
                  </p>
                </div>

                {/* Software Engineers */}
                <div className="bg-[#001e2b]/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-[#001e2b]/10 animate-fade-in stagger-4 hover:border-[#001e2b]/20 transition-all duration-300">
                  <h3 className="text-2xl font-semibold text-[#001e2b] mb-3 font-bricolage">
                    Explain Code to Others
                  </h3>
                  <p className="text-[#001e2b]/70 text-lg">
                    Easily communicate logic and execution flow with teammates,
                    students, or clients using clear visuals.
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
                      What types of code files can I upload?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      You can paste code directly in the input box, and it will
                      support any programming language. However, if you choose
                      to upload a file, we currently support .txt, .pdf, .js,
                      .py, .java, .sql, .cpp, and more. We are constantly
                      improving support for more formats!
                    </p>
                  </div>

                  {/* FAQ Item 2 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      Why is this tool free?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      We offer this tool for free to help developers, students,
                      and professionals better understand their code visually.
                      We use a daily limit to control API costs, but users can
                      enter their own API keys for unlimited usage.
                    </p>
                  </div>

                  {/* FAQ Item 3 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      Is my uploaded code stored or shared?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      No, your code is processed securely and never shared. The
                      code is stored in database to eliminate duplicate api
                      calling and it will be auto-cleaned every 6 hours. We
                      respect your privacy and ensure data safety.
                    </p>
                  </div>

                  {/* FAQ Item 4 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      Can I use my own API key for unlimited diagrams?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      Yes! If you have your own Google Gemini and Mistral API
                      keys, you can enter them to bypass the daily limit and
                      generate unlimited diagrams. Your API keys are stored
                      securely in your local storage and never sent to our
                      servers.
                    </p>
                  </div>
                  {/* FAQ Item 5 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      What programming languages do you support?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      Our tool supports any programming language when pasting
                      code directly.
                    </p>
                  </div>
                  {/* FAQ Item 6 */}
                  <div className="bg-white rounded-lg border-2 border-[#001e2b] p-6">
                    <h3 className="text-lg font-semibold text-[#001e2b] mb-2 font-bricolage">
                      How long does it take to generate a flowchart?
                    </h3>
                    <p className="text-[#001e2b]/70">
                      The process is almost instant! Once you paste or upload
                      your file, AI analyzes it and generates a flowchart in
                      just a few seconds.
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
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}
