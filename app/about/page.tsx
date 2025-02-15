"use client";

import { Header } from "../components/Header";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { GridPattern } from "../components/GridPattern";

export default function About() {
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
                About CodetoFlows
              </h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-[#001e2b]/70 mb-6">
                  FlowViz is an AI-powered code visualization tool that
                  transforms your code into beautiful, interactive flowcharts in
                  seconds. Our mission is to make code understanding and
                  documentation more intuitive and accessible for everyone.
                </p>

                <h2 className="text-2xl font-semibold text-[#001e2b] mt-12 mb-4 font-bricolage">
                  Our Vision
                </h2>
                <p className="text-[#001e2b]/70 mb-6">
                  We believe that visual representation of code should be
                  effortless. Whether you&apos;re a seasoned developer
                  documenting your work, a team lead explaining system
                  architecture, or a student learning to code, FlowViz helps you
                  understand and communicate code structure more effectively.
                </p>

                <h2 className="text-2xl font-semibold text-[#001e2b] mt-12 mb-4 font-['Bricolage_Grotesque']">
                  How It Works
                </h2>
                <p className="text-[#001e2b]/70 mb-6">
                  FlowViz uses advanced AI models (Google's Gemini and Mistral)
                  to analyze your code and generate comprehensive flowcharts.
                  Our system understands code context, identifies key processes,
                  and creates clear visual representations that highlight the
                  logic flow.
                </p>

                <h2 className="text-2xl font-semibold text-[#001e2b] mt-12 mb-4 font-['Bricolage_Grotesque']">
                  Features
                </h2>
                <ul className="list-disc list-inside text-[#001e2b]/70 mb-6 space-y-2">
                  <li>Instant code to flowchart conversion</li>
                  <li>Support for multiple programming languages</li>
                  <li>Interactive diagram viewing</li>
                  <li>Step-by-step execution explanation</li>
                  <li>Easy export and sharing options</li>
                  <li>Custom API key support for unlimited usage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
