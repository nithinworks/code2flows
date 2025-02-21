"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useAuth } from "@/lib/context/auth";
import { supabase } from "@/lib/supabase/client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg border-2 border-[#001e2b] bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#001e2b]/60 hover:text-[#001e2b]"
        >
          <FiX className="h-5 w-5" />
        </button>

        <h2 className="mb-6 font-bricolage text-2xl font-semibold text-[#001e2b]">
          Profile
        </h2>

        <div className="mb-6">
          <label className="text-sm font-medium text-[#001e2b]/70">Email</label>
          <div className="mt-1 text-[#001e2b]">{user?.email}</div>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#001e2b]">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border-2 border-[#001e2b] bg-white px-3 py-2 text-sm text-[#001e2b] placeholder-[#001e2b]/40 focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#001e2b]">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border-2 border-[#001e2b] bg-white px-3 py-2 text-sm text-[#001e2b] placeholder-[#001e2b]/40 focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
              placeholder="Confirm new password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#00ed64] px-4 py-2 text-sm font-medium text-black hover:bg-[#00ed69]/90 focus:outline-none focus:ring-2 focus:ring-[#00ed64] disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
