"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const userId = Buffer.from(token, "base64").toString();
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          setStatus("success");
          await refreshUser();
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f6]">
      <div className="bg-white p-8 rounded-lg border-2 border-[#001e2b] max-w-md w-full font-bricolage">
        {status === "loading" && (
          <p className="text-center text-[#001e2b]">Verifying your email...</p>
        )}
        {status === "success" && (
          <div className="text-center">
            <h1 className="text-[#001e2b] text-xl font-semibold mb-2">
              Email Verified!
            </h1>
            <p className="text-[#001e2b]/70">
              You can now start generating diagrams. Redirecting...
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="text-center">
            <h1 className="text-red-500 text-xl font-semibold mb-2">
              Verification Failed
            </h1>
            <p className="text-[#001e2b]/70">
              Please try again or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
