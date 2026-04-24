"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)" }}>
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          We hit a small hiccup on our end. Our kitchen is still open —
          please try again in a moment.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-2xl font-bold text-white transition-transform active:scale-95"
            style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}
          >
            🔄 Try Again
          </button>
          <a
            href="/"
            className="px-6 py-3 rounded-2xl font-bold transition-transform active:scale-95"
            style={{ background: "white", color: "#0d9488", border: "2px solid #0d9488" }}
          >
            🏠 Go Home
          </a>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
