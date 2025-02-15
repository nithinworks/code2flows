"use client";

import { Header } from "../components/Header";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { GridPattern } from "../components/GridPattern";

export default function Changelog() {
  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <BackgroundGradient />
        <GridPattern />
      </div>

      <div className="h-full w-full flex md:items-center md:justify-center antialiased relative overflow-hidden">
        <Header />

        <div className="relative z-10 w-full mt-32">
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
                      March 15, 2024
                    </span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#001e2b]/70">
                      Initial release of FlowViz with core features:
                    </p>
                    <ul className="list-disc list-inside text-[#001e2b]/70 space-y-2">
                      <li>AI-powered code to flowchart conversion</li>
                      <li>Support for multiple programming languages</li>
                      <li>Interactive diagram viewer</li>
                      <li>Step-by-step execution explanation</li>
                      <li>Custom API key support</li>
                      <li>Local storage for API keys</li>
                      <li>Daily usage limits and tracking</li>
                    </ul>
                  </div>
                </div>

                {/* Version 0.9.0 (Beta) */}
                <div className="border-l-2 border-[#001e2b]/10 pl-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-lg font-semibold text-[#001e2b] font-['Bricolage_Grotesque']">
                      Version 0.9.0
                    </span>
                    <span className="text-sm text-[#001e2b]/40">
                      March 1, 2024
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#001e2b]/5 text-[#001e2b]/70 rounded-full border border-[#001e2b]/10">
                      BETA
                    </span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[#001e2b]/70">
                      Beta release with initial testing:
                    </p>
                    <ul className="list-disc list-inside text-[#001e2b]/70 space-y-2">
                      <li>Basic code parsing functionality</li>
                      <li>Simple flowchart generation</li>
                      <li>Limited language support</li>
                      <li>Basic user interface</li>
                      <li>Performance optimizations</li>
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
                      <li>Team collaboration features</li>
                      <li>More programming language support</li>
                      <li>Enhanced AI analysis capabilities</li>
                      <li>Project management integration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
