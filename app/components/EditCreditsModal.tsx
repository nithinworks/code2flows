"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

interface EditCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
  currentCredits: number;
  onUpdate: (userId: string, credits: number, notes: string) => Promise<void>;
}

export default function EditCreditsModal({
  isOpen,
  onClose,
  userEmail,
  userId,
  currentCredits,
  onUpdate,
}: EditCreditsModalProps) {
  const [credits, setCredits] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onUpdate(userId, parseInt(credits), notes);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update credits"
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

        <h2 className="mb-4 text-xl font-semibold text-[#001e2b]">
          Edit Credits: {userEmail}
        </h2>
        <p className="mb-4 text-sm text-[#001e2b]/60">
          Current Credits: {currentCredits}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#001e2b]">
              Adjust Credits
            </label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full rounded-md border-2 border-[#001e2b] bg-white px-3 py-2 text-sm text-[#001e2b] placeholder-[#001e2b]/40"
              placeholder="Enter positive or negative value"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#001e2b]">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-2 border-[#001e2b] bg-white px-3 py-2 text-sm text-[#001e2b] placeholder-[#001e2b]/40"
              placeholder="Reason for adjustment"
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded bg-red-50 p-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#001e2b] px-4 py-2 text-sm font-medium text-white hover:bg-[#001e2b]/90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Credits"}
          </button>
        </form>
      </div>
    </div>
  );
}
