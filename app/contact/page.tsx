"use client";

import { Header } from "../components/Header";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { GridPattern } from "../components/GridPattern";
import { Footer } from "../components/Footer";
import { FiMail } from "react-icons/fi";

export default function Contact() {
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
                Contact Us
              </h1>

              <div className="prose prose-lg max-w-none">
                <p className="text-[#001e2b]/70 mb-8">
                  Have questions or feedback? We'd love to hear from you. Feel
                  free to reach out:
                </p>

                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={handleContact}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00ed64] text-[#001e2b] rounded-md border-2 border-[#001e2b] hover:bg-[#00ed64]/90 transition font-semibold"
                  >
                    <FiMail className="w-5 h-5" />
                    Contact Us
                  </button>
                </div>

                <p className="text-[#001e2b]/70">
                  We typically respond within 24 hours during business days. For
                  faster support, make sure to include details about your
                  inquiry.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
