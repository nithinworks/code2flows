"use client";

import { useEffect, useRef, useState } from "react";
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

interface ERDiagramViewerProps {
  chart: string;
  entityRelations: string;
}

// Initialize Mermaid with ER diagram settings
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    er: {
      useMaxWidth: false,
      padding: 20,
      layoutDirection: "TB",
      minEntityWidth: 100,
      minEntityHeight: 75,
      entityPadding: 15,
      stroke: "#001e2b",
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

export default function ERDiagramViewer({
  chart,
  entityRelations,
}: ERDiagramViewerProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(
          `er-diagram-${Date.now()}`, // Add unique ID to prevent conflicts
          `erDiagram\n${chart}`
        );
        setSvgContent(svg);
      } catch (error) {
        console.error("Error rendering ER diagram:", error);
      }
    };

    renderDiagram();
  }, [chart]);

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "er-diagram.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="space-y-4">
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
      <div className="relative w-full">
        {/* ER Diagram View */}
        <div
          className={`w-full overflow-hidden bg-white rounded-lg border-2 border-[#001e2b] ${
            showExplanation ? "hidden" : "block"
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

        {/* Explanation View */}
        <div
          className={`w-full bg-white rounded-lg border-2 border-[#001e2b] ${
            showExplanation ? "block" : "hidden"
          }`}
        >
          <div className="p-4 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold text-[#001e2b] mb-4 font-bricolage">
              Entity Relations
            </h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-[#001e2b]/80 font-sans text-sm leading-relaxed">
                {entityRelations}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
