"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer section error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-black text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          We&apos;re having trouble loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: "#0d9488" }}
          >
            Try Again
          </button>
          <Link
            href="/menu"
            className="px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "#f0fdfa", color: "#0d9488" }}
          >
            Go to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
