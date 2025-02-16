"use client";

import { Header } from "../components/Header";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { GridPattern } from "../components/GridPattern";
import { Footer } from "../components/Footer";

export default function Changelog() {
  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <BackgroundGradient />
        <GridPattern />
      </div>

      <div className="min-h-screen flex flex-col antialiased relative">
        <Header />

        <div className="flex-grow relative z-10 w-full mt-32">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-[#001e2b] mb-8 font-bricolage">
                Changelog
              </h1>

              <div className="space-y-12">
                {/* Version 1.0.0 */}
                <div className="border-l-2 border-[#00ed64] pl-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-lg font-semibold text-[#001e2b] font-['Bricolage_Grotesque']">
                      Version 1.0.0
                    </span>
                    <span className="text-sm text-[#001e2b]/40">
                      February 22, 2025
                    </span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#001e2b]/70">
                      Initial release of CodeToFlows with core features:
                    </p>
                    <ul className="list-disc list-inside text-[#001e2b]/70 space-y-2">
                      <li>AI-powered code to flowchart conversion</li>
                      <li>Support for multiple programming languages</li>
                      <li>Interactive diagram viewer</li>
                      <li>Step-by-step execution explanation</li>
                      <li>Custom API key support</li>
                      <li>Local storage for API keys</li>
                      <li>50 Daily usage limits</li>
                    </ul>
                  </div>
                </div>

                {/* Future Updates */}
                <div className="border-l-2 border-[#001e2b]/10 pl-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-lg font-semibold text-[#001e2b] font-['Bricolage_Grotesque']">
                      Coming Soon
                    </span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#001e2b]/70">
                      Planned features and improvements:
                    </p>
                    <ul className="list-disc list-inside text-[#001e2b]/70 space-y-2">
                      <li>Advanced customization options for diagrams</li>
                      <li>More programming language files upload support</li>
                      <li>Enhanced AI analysis capabilities</li>
                      <li>ER Diagram Visualizer</li>
                      <li>Architecture Diagram Visualizer</li>
                    </ul>
                  </div>
                </div>
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
