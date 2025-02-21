"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth";
import { FiX, FiMail } from "react-icons/fi";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        // Show verification message after successful signup
        setShowVerificationMessage(true);

        // Send verification email
        await fetch("/api/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setShowVerificationMessage(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowVerificationMessage(false);
    setEmail("");
    setPassword("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg border-2 border-[#001e2b] bg-white p-6 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-[#001e2b]/60 hover:text-[#001e2b]"
        >
          <FiX className="h-5 w-5" />
        </button>

        {showVerificationMessage ? (
          // Verification Message View
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#00ed64]/10">
              <FiMail className="h-6 w-6 text-[#00ed64]" />
            </div>
            <h2 className="mb-2 font-bricolage text-xl font-semibold text-[#001e2b]">
              Check your email
            </h2>
            <p className="mb-6 text-[#001e2b]/60">
              We've sent a verification link to{" "}
              <span className="font-medium text-[#001e2b]">{email}</span>.
              Please check your inbox and click the link to verify your account.
            </p>
            <button
              onClick={handleClose}
              className="w-full rounded-md bg-[#00ed64] px-4 py-2 text-sm font-medium text-black hover:bg-[#00ed64]/90"
            >
              Got it
            </button>
          </div>
        ) : (
          // Sign In/Sign Up Form
          <>
            <h2 className="mb-6 font-bricolage text-2xl font-semibold text-[#001e2b]">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#001e2b]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border-2 border-[#001e2b] bg-white px-3 py-2 text-sm text-[#001e2b] placeholder-[#001e2b]/40 focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[#001e2b]"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border-2 border-[#001e2b] bg-white px-3 py-2 text-sm text-[#001e2b] placeholder-[#001e2b]/40 focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#00ed64] px-4 py-2 text-sm font-medium text-black hover:bg-[#00ed64]/90 focus:outline-none focus:ring-2 focus:ring-[#00ed64] disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-[#001e2b]/60">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="font-medium text-[#001e2b] hover:text-[#00ed64]"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
