import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="w-full py-4 md:py-6 border-t-2 border-[#001e2b] bg-[#fbf9f6]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
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
                />
              </div>
              <span className="font-semibold text-lg font-bricolage">
                CodetoFlows
              </span>
            </Link>
          </div>

          {/* Navigation Links - Only visible on desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/about"
              className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm"
            >
              Contact
            </Link>
            <Link
              href="/changelog"
              className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-sm"
            >
              Changelog
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs md:text-sm text-[#001e2b]/60 text-center md:text-right">
            © {new Date().getFullYear()} CodetoFlows. All rights reserved.
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="md:hidden flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[#001e2b]/10">
          <Link
            href="/about"
            className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-xs"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-xs"
          >
            Contact
          </Link>
          <Link
            href="/changelog"
            className="text-[#001e2b]/70 hover:text-[#001e2b] transition text-xs"
          >
            Changelog
          </Link>
        </div>
      </div>
    </footer>
  );
};
