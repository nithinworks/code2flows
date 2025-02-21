"use client";

import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { GridPattern } from "../components/GridPattern";
import { useAuth } from "@/lib/context/auth";
import AuthModal from "../components/AuthModal";
import { loadStripe } from "@stripe/stripe-js";

const creditPacks = [
  {
    id: "basic-pack",
    name: "Basic Pack",
    credits: 25,
    originalPrice: 9.99,
    price: 4.99,
    description: "Perfect for trying out our diagram generation tools",
  },
  {
    id: "hobby-pack",
    name: "Hobby Pack",
    credits: 50,
    originalPrice: 19.99,
    price: 9.99,
    description: "Great for regular use and small projects",
    popular: true,
  },
  {
    id: "premium-pack",
    name: "Premium Pack",
    credits: 100,
    originalPrice: 39.99,
    price: 19.99,
    description: "Best value for power users and teams",
  },
];

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error("Stripe publishable key is missing");
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

export default function Credits() {
  const { user, refreshCredits } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");

    if (query.get("success") && sessionId) {
      // Verify the session
      const verifySession = async () => {
        try {
          const response = await fetch("/api/verify-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });

          if (response.ok) {
            await refreshCredits();
          }
        } catch (error) {
          console.error("Verification failed:", error);
        }
      };

      verifySession();
      // Clean URL
      window.history.replaceState({}, "", "/credits");
    }
  }, [refreshCredits]);

  const handlePurchase = async (packId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <BackgroundGradient />
        <GridPattern />
      </div>

      <div className="h-full w-full flex flex-col md:items-center md:justify-center antialiased relative overflow-hidden">
        <Header />

        <div className="relative z-10 w-full mt-16 md:mt-24 flex-grow">
          <div className="container mx-auto px-4 py-8 md:py-16">
            {/* Main Heading */}
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 animate-fade-in stagger-1">
              <h1 className="text-[32px] md:text-[50px] leading-tight font-bold mb-3 md:mb-4 text-[#001e2b] font-bricolage">
                Credit Packs
              </h1>
              <p className="text-lg md:text-xl text-[#001e2b]/60 font-medium">
                Purchase credits to generate more diagrams
              </p>
            </div>

            {/* Credit Packs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-scale-in stagger-2">
              {creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative bg-white rounded-lg border-2 ${
                    pack.popular
                      ? "border-[#00ed64] shadow-lg shadow-[#00ed64]/10"
                      : "border-[#001e2b]"
                  } p-6 md:p-8 flex flex-col`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ed64] text-[#001e2b] text-sm font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#001e2b] mb-2 font-bricolage">
                      {pack.name}
                    </h3>
                    <p className="text-[#001e2b]/60 text-sm">
                      {pack.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#001e2b]">
                        ${pack.price}
                      </span>
                      <span className="text-[#001e2b]/40 line-through">
                        ${pack.originalPrice}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-[#001e2b]/60">
                      {pack.credits} credits
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pack.id)}
                    className={`mt-auto w-full py-3 px-4 rounded-md border-2 transition-all font-semibold ${
                      pack.popular
                        ? "bg-[#00ed64] text-[#001e2b] border-[#001e2b] hover:bg-[#00ed64]/90"
                        : "bg-white text-[#001e2b] border-[#001e2b] hover:bg-[#001e2b]/5"
                    }`}
                  >
                    Purchase Pack
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center text-[#001e2b]/60 text-sm max-w-2xl mx-auto">
              <p>
                Credits never expire and can be used for any type of diagram
                generation. Each diagram generation costs 1 credit.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}
