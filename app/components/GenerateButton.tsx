import { useAuth } from "@/lib/context/auth";

export function GenerateButton({
  loading,
  loadingStep,
}: {
  loading: boolean;
  loadingStep: string;
}) {
  const { user } = useAuth();

  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full py-3 px-4 bg-[#00ed64] text-[#001e2b] font-semibold rounded-md border-2 border-[#001e2b] transition-all hover:bg-[#00ed64]/90 ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-3">
          <span className="w-4 h-4 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin"></span>
          <span>{loadingStep}</span>
        </div>
      ) : user ? (
        "Generate Flowchart"
      ) : (
        "Sign in to Generate"
      )}
    </button>
  );
}
