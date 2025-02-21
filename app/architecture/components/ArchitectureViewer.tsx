"use client";

import { useEffect, useRef, useState, memo } from "react";
import mermaid from "mermaid";
import {
  FiDownload,
  FiCopy,
  FiCheck,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { TbArrowsMinimize } from "react-icons/tb";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

interface ArchitectureViewerProps {
  chart: string;
  analysis: string;
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

const AnalysisView = memo(({ analysis }: { analysis: string }) => (
  <div className="w-full overflow-auto bg-white p-4 md:p-8 rounded-lg min-h-[300px]">
    <h3 className="text-lg md:text-xl font-semibold text-[#001e2b] mb-4 font-bricolage">
      Architecture Analysis
    </h3>
    <div className="prose max-w-none">
      <pre className="whitespace-pre-wrap text-[#001e2b]/80 font-sans text-sm leading-relaxed">
        {analysis}
      </pre>
    </div>
  </div>
));

DiagramView.displayName = "DiagramView";
AnalysisView.displayName = "AnalysisView";

// Initialize Mermaid with architecture diagram settings
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    logLevel: "error",
    flowchart: {
      useMaxWidth: false,
      padding: 20,
      nodeSpacing: 50,
      rankSpacing: 50,
      curve: "basis",
      htmlLabels: true,
      defaultRenderer: "elk",
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
      mainBkg: "#ffffff",
      nodeBorder: "#001e2b",
      clusterBkg: "#fbf9f6",
      titleColor: "#001e2b",
      edgeLabelBackground: "#ffffff",
    },
  });
}

const ZoomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) => (
  <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-md border border-[#001e2b]/10 p-1 shadow-sm z-10">
    <button
      onClick={onZoomIn}
      className="p-1.5 text-[#001e2b]/60 hover:text-[#001e2b] hover:bg-[#001e2b]/5 rounded transition"
      title="Zoom In"
    >
      <FiZoomIn className="w-3.5 h-3.5" />
    </button>
    <div className="w-[1px] h-4 bg-[#001e2b]/10" />
    <button
      onClick={onZoomOut}
      className="p-1.5 text-[#001e2b]/60 hover:text-[#001e2b] hover:bg-[#001e2b]/5 rounded transition"
      title="Zoom Out"
    >
      <FiZoomOut className="w-3.5 h-3.5" />
    </button>
    <div className="w-[1px] h-4 bg-[#001e2b]/10" />
    <button
      onClick={onReset}
      className="p-1.5 text-[#001e2b]/60 hover:text-[#001e2b] hover:bg-[#001e2b]/5 rounded transition"
      title="Reset View"
    >
      <TbArrowsMinimize className="w-3.5 h-3.5" />
    </button>
  </div>
);

// Clean SVG for export
const cleanSvgForExport = (svg: string): string => {
  const hasXmlns = svg.includes('xmlns="http://www.w3.org/2000/svg"');
  const hasXmlnsXlink = svg.includes(
    'xmlns:xlink="http://www.w3.org/1999/xlink"'
  );

  return (
    svg
      // First remove any existing XML declaration and DOCTYPE
      .replace(/<\?xml.*?\?>/, "")
      .replace(/<!DOCTYPE.*?>/, "")
      // Add style definitions
      .replace(
        /<svg([^>]*)>/,
        `<svg$1>
        <defs>
          <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&amp;display=swap');
            .node rect { fill: #ffffff; stroke: #001e2b; stroke-width: 2; }
            .node .label { fill: #001e2b; font-family: 'Plus Jakarta Sans'; }
            .node .icon { fill: #00ed64; }
            .edgePath path { stroke: #001e2b; stroke-width: 1; }
            .edgeLabel { fill: #001e2b; font-family: 'Plus Jakarta Sans'; }
            .cluster rect { fill: #fbf9f6; stroke: #001e2b; stroke-width: 1; }
          </style>
        </defs>`
      )
      // Add namespaces if needed
      .replace(/<svg([^>]*)>/, (match, attrs) => {
        let newAttrs = attrs;
        if (!hasXmlns) {
          newAttrs += ' xmlns="http://www.w3.org/2000/svg"';
        }
        if (!hasXmlnsXlink) {
          newAttrs += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
        }
        return `<svg${newAttrs}>`;
      })
      // Remove mermaid-specific scripts
      .replace(/<script[\s\S]*?<\/script>/g, "")
      // Fix any self-closing tags
      .replace(/<(\w+)([^>]*?)\s*\/>/g, "<$1$2></$1>")
      // Add dimensions if missing
      .replace(/<svg([^>]*)>/, (match, attrs) => {
        if (!attrs.includes("width") || !attrs.includes("height")) {
          return match.replace(
            ">",
            ' width="100%" height="100%" viewBox="0 0 800 600">'
          );
        }
        return match;
      })
      // Add XML declaration
      .replace(
        /^/,
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
      )
  );
};

export default function ArchitectureViewer({
  chart,
  analysis,
}: ArchitectureViewerProps) {
  const [hasError, setHasError] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        console.log("Attempting to render chart:", chart);
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, chart);

        // Clean and enhance SVG
        const cleanedSvg = svg
          .replace(/<g class="error-icon".*?<\/g>/g, "")
          .replace(/<text class="error-text".*?<\/text>/g, "")
          .replace(/<g class="error-message".*?<\/g>/g, "")
          .replace(/Syntax error.*?mermaid version.*?\)/g, "")
          // Style nodes and icons
          .replace(
            /(<rect[^>]*class="node"[^>]*)/g,
            '$1 fill="#ffffff" stroke="#001e2b" stroke-width="2"'
          )
          .replace(
            /(<text[^>]*class="nodeLabel"[^>]*>)/g,
            '$1<tspan fill="#001e2b" font-family="Plus Jakarta Sans">'
          )
          // Style edges and labels
          .replace(
            /(<path[^>]*class="edge"[^>]*)/g,
            '$1 stroke="#001e2b" stroke-width="1"'
          )
          .replace(
            /(<text[^>]*class="edgeLabel"[^>]*>)/g,
            '$1<tspan fill="#001e2b" font-family="Plus Jakarta Sans">'
          )
          // Ensure all text elements have closing tspans
          .replace(/<\/text>/g, "</tspan></text>");

        setSvgContent(cleanedSvg);
        setHasError(false);
      } catch (error) {
        console.error("Mermaid initialization error:", error);
        console.log("Failed chart content:", chart);
        setHasError(true);
      }
    };

    if (chart) {
      initializeMermaid();
    }
  }, [chart]);

  const downloadSVG = () => {
    if (!svgContent) return;

    try {
      const cleanedSvg = cleanSvgForExport(svgContent);

      // Create a temporary element to validate SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedSvg, "image/svg+xml");
      if (doc.documentElement.tagName === "parsererror") {
        throw new Error("Invalid SVG generated");
      }

      const blob = new Blob([cleanedSvg], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "architecture-diagram.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download SVG:", err);
    }
  };

  const copySVG = async () => {
    if (!svgContent) return;
    try {
      const cleanedSvg = cleanSvgForExport(svgContent);

      // Validate SVG before copying
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedSvg, "image/svg+xml");
      if (doc.documentElement.tagName === "parsererror") {
        throw new Error("Invalid SVG generated");
      }

      await navigator.clipboard.writeText(cleanedSvg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy SVG:", err);
    }
  };

  const handleZoomIn = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomIn(0.5);
    }
  };

  const handleZoomOut = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.zoomOut(0.5);
    }
  };

  const handleReset = () => {
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
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
          We couldn't generate the architecture diagram. Try adjusting your
          description or use different details.
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
            <span className="text-sm text-[0.8rem]">Download SVG</span>
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
            <span className="text-sm text-[0.8rem]">
              {copied ? "Copied!" : "Copy SVG"}
            </span>
          </button>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between md:justify-end space-x-3">
          <span className="text-[#001e2b]/70 text-sm font-medium">
            {showAnalysis ? "Show Diagram" : "Show Analysis"}
          </span>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${
              showAnalysis ? "bg-[#00ed64]" : "bg-[#001e2b]/20"
            }`}
          >
            <span className="sr-only">Toggle view</span>
            <span
              className={`${
                showAnalysis ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ease-in-out border border-[#001e2b]`}
            />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative w-full">
        {/* Architecture Diagram View */}
        <div
          className={`w-full overflow-hidden bg-white rounded-lg border-2 border-[#001e2b] ${
            showAnalysis ? "hidden" : "block"
          }`}
        >
          <TransformWrapper
            ref={transformComponentRef}
            initialScale={1}
            minScale={0.5}
            maxScale={2}
            centerOnInit
            limitToBounds
            doubleClick={{ disabled: true }}
            panning={{ disabled: false }}
            wheel={{ disabled: false }}
            pinch={{ disabled: false }}
          >
            <ZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
            />
            <TransformComponent
              wrapperClass="!w-full !h-full min-h-[300px]"
              contentClass="!w-full !h-full"
            >
              <div
                className="w-full h-full flex items-center justify-center p-4"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>

        {/* Analysis View */}
        <div
          className={`w-full bg-white rounded-lg border-2 border-[#001e2b] ${
            showAnalysis ? "block" : "hidden"
          }`}
        >
          <div className="p-4 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold text-[#001e2b] mb-4 font-bricolage">
              Architecture Analysis
            </h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-[#001e2b]/80 font-sans text-sm leading-relaxed">
                {analysis}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
