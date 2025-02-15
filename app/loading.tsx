"use client";

import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#fbf9f6] z-[100] flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <div className="w-16 h-16 mb-8">
          <Image
            src="/Codetoflows.svg"
            alt="Loading..."
            width={64}
            height={64}
            className="animate-pulse"
          />
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-[#001e2b]/10 rounded-full overflow-hidden">
          <div className="h-full w-full bg-[#00ed64] rounded-full animate-loading-bar" />
        </div>

        {/* Loading text */}
        <div className="mt-4 text-sm text-[#001e2b]/60">
          Loading amazing things...
        </div>
      </div>
    </div>
  );
}
