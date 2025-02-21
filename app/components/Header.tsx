"use client";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/auth";
import AuthModal from "./AuthModal";
import ProfileModal from "./ProfileModal";

export const Header = () => {
  const { user, credits, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9f6] border-b-2 border-[#001e2b]">
        <nav className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
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

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                Code Vizualizer
              </Link>
              <Link
                href="/er-diagram"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                ER Diagram Vizualizer
              </Link>
              <Link
                href="/architecture"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                Architecture Vizualizer
              </Link>
              <Link
                href="/credits"
                className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
              >
                Credits Pack
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#00ed64]/10 text-[#001e2b] text-sm font-semibold rounded-full border border-[#00ed64]">
                      {credits} credits
                    </span>
                    <div className="relative" ref={profileMenuRef}>
                      <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="p-2 rounded-md border-2 border-[#001e2b] text-[#001e2b] hover:bg-[#001e2b]/5 transition"
                      >
                        <FiUser className="w-4 h-4" />
                      </button>

                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md border-2 border-[#001e2b] shadow-lg py-1">
                          <button
                            onClick={() => {
                              setIsProfileModalOpen(true);
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-[#001e2b]/70 hover:text-[#001e2b] hover:bg-[#001e2b]/5 transition flex items-center gap-2"
                          >
                            <FiUser className="w-4 h-4" />
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              signOut();
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-[#001e2b]/70 hover:text-[#001e2b] hover:bg-[#001e2b]/5 transition flex items-center gap-2"
                          >
                            <FiLogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-md border-2 border-[#001e2b] text-sm text-[#001e2b] hover:bg-[#001e2b]/5 transition font-semibold"
                >
                  Sign In
                </button>
              )}

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

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#001e2b]/10">
              <div className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  Code Vizualizer
                </Link>
                <Link
                  href="/er-diagram"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  ER Diagram Vizualizer
                </Link>
                <Link
                  href="/architecture"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  Architecture Vizualizer
                </Link>
                <Link
                  href="/credits"
                  className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm font-medium"
                >
                  Credits Pack
                </Link>

                {user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#00ed64]/10 text-[#001e2b] text-sm font-semibold rounded-full border border-[#00ed64]">
                        {credits} credits
                      </span>
                    </div>
                    <div className="text-sm text-[#001e2b]/70 px-1">
                      {user.email}
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-md border-2 border-[#001e2b] text-sm text-[#001e2b] hover:bg-[#001e2b]/5 transition font-semibold w-full justify-center"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-md border-2 border-[#001e2b] text-sm text-[#001e2b] hover:bg-[#001e2b]/5 transition font-semibold w-full justify-center"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
