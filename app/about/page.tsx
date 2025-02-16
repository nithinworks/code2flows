"use client";

import { Header } from "../components/Header";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { GridPattern } from "../components/GridPattern";
import { Footer } from "../components/Footer";
import { FiMail } from "react-icons/fi";

export default function About() {
  const email = "connect.naganithin@gmail.com";

  const handleContact = () => {
    window.location.href = `mailto:${email}`;
  };

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
                About CodetoFlows
              </h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-[#001e2b]/70 mb-6">
                  At CodetoFlows, we believe that code should be easy to
                  understand—both for beginners and experienced developers. Our
                  mission is to simplify code visualization by transforming raw
                  code into beautiful, interactive flowcharts using AI.
                </p>

                <p className="text-[#001e2b]/70 mb-6">
                  This tool was created to help developers, students, and
                  engineers quickly grasp complex logic, debug faster, and
                  document their code effortlessly. By leveraging Google Gemini
                  2.0 Flash and Mistral AI, we provide accurate step-by-step
                  execution flows without compromising performance or privacy.
                </p>

                <h2 className="text-2xl font-semibold text-[#001e2b] mt-12 mb-4 font-['Bricolage_Grotesque']">
                  💡 Why Choose Us?
                </h2>
                <ul className="list-disc list-inside text-[#001e2b]/70 mb-6 space-y-2">
                  <li>
                    <b>Supports Any Programming Language</b> – Paste any code or
                    upload a file.
                  </li>
                  <li>
                    <b>Instant AI-Powered Flowcharts</b> – Understand code
                    execution at a glance.
                  </li>
                  <li>
                    <b>Completely Private</b> – Your code is never shared.
                  </li>
                  <li>
                    <b>Free to Use</b> – Generate up to 50 diagrams per day or
                    use your own API key for unlimited access.
                  </li>
                </ul>
                <h2 className="text-2xl font-semibold text-[#001e2b] mt-12 mb-4 font-bricolage">
                  About the Creator
                </h2>
                <p className="text-[#001e2b]/70 mb-6">
                  Hi, I'm Naga Nithin, the developer behind CodeToFlows. As a
                  passionate software engineer, I built this tool to help
                  developers and students better visualize their code and make
                  learning and debugging easier. I'm always open to feedback,
                  and new ideas! Feel free to connect with me:
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={handleContact}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00ed64] text-[#001e2b] rounded-md border-2 border-[#001e2b] hover:bg-[#00ed64]/90 transition font-semibold"
                  >
                    <FiMail className="w-5 h-5" />
                    Contact Me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
