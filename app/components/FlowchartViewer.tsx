"use client";

import { useEffect, useRef, useState, memo } from "react";
import mermaid from "mermaid";
import { FiDownload, FiCopy, FiCheck } from "react-icons/fi";

interface FlowchartViewerProps {
  chart: string;
  executionSteps: string;
}

// Memoize the content display components
const DiagramView = memo(({ svgContent }: { svgContent: string }) => (
  <div className="w-full overflow-auto bg-white p-4 md:p-8 rounded-lg min-h-[300px]">
    <div
      className="w-full flex justify-center"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  </div>
));

const ExplanationView = memo(
  ({ executionSteps }: { executionSteps: string }) => (
    <div className="w-full overflow-auto bg-white p-4 md:p-8 rounded-lg min-h-[300px]">
      <h3 className="text-lg md:text-xl font-semibold text-[#001e2b] mb-4 font-bricolage">
        Execution Steps
      </h3>
      <div className="prose max-w-none">
        <pre
          className="whitespace-pre-wrap text-[#001e2b]/80 font-sans text-sm leading-relaxed [&>*]:mb-4"
          style={{
            display: "block",
          }}
        >
          {executionSteps.split("\n").map((line, index) =>
            line.trim().match(/^\d+\./) ? (
              <div
                key={index}
                className="mb-4"
                style={{ marginTop: index === 0 ? 0 : "1rem" }}
              >
                {line}
              </div>
            ) : (
              <div key={index}>{line}</div>
            )
          )}
        </pre>
      </div>
    </div>
  )
);

DiagramView.displayName = "DiagramView";
ExplanationView.displayName = "ExplanationView";

// Initialize Mermaid once
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    logLevel: 5,
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      padding: 20,
      nodeSpacing: 50,
      rankSpacing: 80,
      defaultRenderer: "elk",
      useMaxWidth: false,
    },
    themeVariables: {
      fontFamily: "Plus Jakarta Sans",
      fontSize: "14px",
      primaryColor: "#00ed64",
      primaryTextColor: "#001e2b",
      primaryBorderColor: "#001e2b",
      lineColor: "#001e2b",
      secondaryColor: "#fbf9f6",
      tertiaryColor: "#ffffff",
    },
  });
}

export default function FlowchartViewer({
  chart,
  executionSteps,
}: FlowchartViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        // Format the incoming chart content
        const formattedChart = `flowchart TD
          ${chart}

          %% Styling
          classDef default fill:#fbf9f6,stroke:#001e2b,color:#001e2b,stroke-width:2px
          classDef start-end fill:#00ed64,stroke:#001e2b,color:#001e2b,stroke-width:2px
          classDef process fill:white,stroke:#001e2b,color:#001e2b,stroke-width:2px
          classDef condition fill:#fbf9f6,stroke:#001e2b,color:#001e2b,stroke-width:2px
          classDef database fill:white,stroke:#001e2b,color:#001e2b,stroke-width:2px

          %% Apply styles
          class A,Z start-end
          class B,C,D,E,F process`;

        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, formattedChart);

        // Remove error icons and messages
        const cleanedSvg = svg
          .replace(/<g class="error-icon".*?<\/g>/g, "")
          .replace(/<text class="error-text".*?<\/text>/g, "")
          .replace(/<g class="error-message".*?<\/g>/g, "")
          .replace(/Syntax error.*?mermaid version.*?\)/g, "");

        setSvgContent(cleanedSvg);
        setHasError(false);
      } catch (error) {
        console.error("Mermaid initialization error:", error);
        setHasError(true);
      }
    };

    if (chart) {
      initializeMermaid();
    }
  }, [chart]);

  // Function to download SVG
  const downloadSVG = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flowchart.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to copy SVG
  const copySVG = async () => {
    if (!svgContent) return;

    try {
      await navigator.clipboard.writeText(svgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy SVG:", err);
    }
  };

  if (hasError) {
    return (
      <div className="w-full overflow-auto bg-white p-4 rounded-lg min-h-[300px] flex flex-col items-center justify-center gap-3 border-2 border-[#001e2b]">
        <div className="text-4xl">😅</div>
        <div className="text-[#001e2b] text-lg font-medium">
          Oops! Our AI had a little hiccup
        </div>
        <div className="text-[#001e2b]/60 text-sm text-center max-w-md">
          We couldn't quite understand the code structure. Try adjusting your
          code a bit or use a different example.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadSVG}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-1.5 bg-white hover:bg-[#001e2b]/5 text-[#001e2b] rounded-md border-2 border-[#001e2b] transition-colors min-w-[120px] font-medium"
            title="Download SVG"
          >
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Download SVG</span>
          </button>
          <button
            onClick={copySVG}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-1.5 bg-white hover:bg-[#001e2b]/5 text-[#001e2b] rounded-md border-2 border-[#001e2b] transition-colors min-w-[120px] font-medium"
            title="Copy SVG"
          >
            {copied ? (
              <FiCheck className="w-4 h-4 text-[#00ed64]" />
            ) : (
              <FiCopy className="w-4 h-4" />
            )}
            <span className="text-sm">{copied ? "Copied!" : "Copy SVG"}</span>
          </button>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between md:justify-end space-x-3">
          <span className="text-[#001e2b]/70 text-sm font-medium">
            {showExplanation ? "Show Diagram" : "Show Explanation"}
          </span>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${
              showExplanation ? "bg-[#00ed64]" : "bg-[#001e2b]/20"
            }`}
          >
            <span className="sr-only">Toggle view</span>
            <span
              className={`${
                showExplanation ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out border border-[#001e2b]`}
            />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative w-full overflow-hidden bg-white rounded-lg border-2 border-[#001e2b]">
        {/* Flowchart View */}
        <div
          className={`transform transition-all duration-500 ease-in-out ${
            showExplanation
              ? "translate-x-full absolute inset-0"
              : "translate-x-0"
          }`}
        >
          <DiagramView svgContent={svgContent} />
        </div>

        {/* Explanation View */}
        <div
          className={`transform transition-all duration-500 ease-in-out ${
            showExplanation
              ? "translate-x-0"
              : "-translate-x-full absolute inset-0"
          }`}
        >
          <ExplanationView executionSteps={executionSteps} />
        </div>
      </div>
    </div>
  );
}
