import Link from "next/link";
import Image from "next/image";
import { FiCode, FiKey, FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(false);
  const [googleKey, setGoogleKey] = useState("");
  const [mistralKey, setMistralKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [validationError, setValidationError] = useState<{
    google?: string;
    mistral?: string;
  }>({});

  useEffect(() => {
    setMounted(true);
    const savedGoogleKey = localStorage.getItem("google_api_key");
    const savedMistralKey = localStorage.getItem("mistral_api_key");
    setGoogleKey(savedGoogleKey || "");
    setMistralKey(savedMistralKey || "");
    setHasApiKeys(!!(savedGoogleKey || savedMistralKey));
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const validateGoogleKey = async (key: string) => {
    if (!key) return true; // Skip validation if key is empty
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=${key}`,
        {
          method: "GET",
        }
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const validateMistralKey = async (key: string) => {
    if (!key) return true; // Skip validation if key is empty
    try {
      const response = await fetch("https://api.mistral.ai/v1/models", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleSave = async () => {
    setValidating(true);
    setValidationError({});

    const errors: { google?: string; mistral?: string } = {};

    // Validate Google API Key
    if (googleKey) {
      const isGoogleValid = await validateGoogleKey(googleKey);
      if (!isGoogleValid) {
        errors.google = "Invalid Google API key";
      }
    }

    // Validate Mistral API Key
    if (mistralKey) {
      const isMistralValid = await validateMistralKey(mistralKey);
      if (!isMistralValid) {
        errors.mistral = "Invalid Mistral API key";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationError(errors);
      setValidating(false);
      return;
    }

    // Save valid keys to localStorage
    if (googleKey) {
      localStorage.setItem("google_api_key", googleKey);
    } else {
      localStorage.removeItem("google_api_key");
    }

    if (mistralKey) {
      localStorage.setItem("mistral_api_key", mistralKey);
    } else {
      localStorage.removeItem("mistral_api_key");
    }

    setHasApiKeys(!!(googleKey || mistralKey));
    setValidating(false);
    setShowModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f6] border-b-2 border-[#001e2b]">
        <nav className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-[#001e2b] hover:opacity-80 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image
                    src="/Codetoflows.svg"
                    alt="CodetoFlows Logo"
                    width={32}
                    height={32}
                    priority
                  />
                </div>
                <span className="font-semibold text-lg font-bricolage">
                  CodetoFlows
                </span>
              </Link>
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#001e2b]/5 text-[#001e2b]/70 rounded-full border border-[#001e2b]/10">
                BETA
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/about"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                Contact
              </Link>
              <Link
                href="/changelog"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                Changelog
              </Link>
            </div>

            {/* Right side with API Key button */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block bg-[#001e2b]/5 text-[#001e2b] px-2.5 py-1 rounded-full text-xs border border-[#001e2b]/10">
                Want unlimited diagrams?
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md border-2 border-[#001e2b] text-sm text-[#001e2b] hover:bg-[#001e2b]/5 transition font-semibold"
              >
                <FiKey className="w-4 h-4" />
                {hasApiKeys ? "Manage API Keys" : "Add API Keys"}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#001e2b] hover:bg-[#001e2b]/5 rounded-md transition"
              >
                {mobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#001e2b]/10">
              <div className="flex flex-col gap-4">
                <Link
                  href="/about"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  Contact
                </Link>
                <Link
                  href="/changelog"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  Changelog
                </Link>
                <button
                  onClick={() => {
                    setShowModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md border-2 border-[#001e2b] text-sm text-[#001e2b] hover:bg-[#001e2b]/5 transition font-semibold w-full justify-center"
                >
                  <FiKey className="w-4 h-4" />
                  {hasApiKeys ? "Manage API Keys" : "Add API Keys"}
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* API Key Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-[#001e2b] w-full max-w-lg p-4 md:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-[#001e2b] font-bricolage">
                API Key Management
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#001e2b]/60 hover:text-[#001e2b] transition"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-[#001e2b]/70 text-sm mb-4">
                Want to generate unlimited diagrams? Add your own API keys
                below. You can add either one or both keys.
              </p>
            </div>

            {/* Google API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#001e2b] mb-2">
                Google API Key
              </label>
              <input
                type="password"
                placeholder="Enter your Google API key"
                className={`w-full px-3 py-2 rounded-md border-2 ${
                  validationError.google
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-[#001e2b]/20 focus:border-[#00ed64] focus:ring-[#00ed64]"
                } transition`}
                onChange={(e) => {
                  setGoogleKey(e.target.value);
                  setValidationError((prev) => ({
                    ...prev,
                    google: undefined,
                  }));
                }}
                value={googleKey}
              />
              {validationError.google && (
                <p className="mt-1 text-xs text-red-500">
                  {validationError.google}
                </p>
              )}
            </div>

            {/* Mistral API Key */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#001e2b] mb-2">
                Mistral API Key
              </label>
              <input
                type="password"
                placeholder="Enter your Mistral API key"
                className={`w-full px-3 py-2 rounded-md border-2 ${
                  validationError.mistral
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-[#001e2b]/20 focus:border-[#00ed64] focus:ring-[#00ed64]"
                } transition`}
                onChange={(e) => {
                  setMistralKey(e.target.value);
                  setValidationError((prev) => ({
                    ...prev,
                    mistral: undefined,
                  }));
                }}
                value={mistralKey}
              />
              {validationError.mistral && (
                <p className="mt-1 text-xs text-red-500">
                  {validationError.mistral}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem("google_api_key");
                  localStorage.removeItem("mistral_api_key");
                  setGoogleKey("");
                  setMistralKey("");
                  setHasApiKeys(false);
                  setValidationError({});
                  setShowModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-[#001e2b]/70 hover:text-[#001e2b] transition"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={validating}
                className="px-4 py-2 bg-[#00ed64] text-[#001e2b] rounded-md text-sm font-semibold border-2 border-[#001e2b] hover:bg-[#00ed64]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {validating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin"></span>
                    Validating...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
