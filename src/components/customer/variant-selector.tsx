"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { MenuVariant } from "@/types";

interface Props {
  itemName: string;
  isVeg: boolean;
  variants: MenuVariant[];
  onSelect: (variant: MenuVariant) => void;
  onClose: () => void;
}

export default function VariantSelector({ itemName, isVeg, variants, onSelect, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        style={{ backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: "white",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          animation: "slideUp 0.25s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 mt-0.5 ${
              isVeg ? "border-green-700 bg-green-500" : "border-red-700 bg-red-500"
            }`} />
            <div>
              <p className="font-bold text-gray-900 text-base leading-tight">{itemName}</p>
              <p className="text-xs text-gray-500 mt-0.5">Choose your size</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Variant options */}
        <div className="px-5 py-4 space-y-3 pb-8">
          {variants.map((v) => (
            <button
              key={v.label}
              onClick={() => { onSelect(v); onClose(); }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all active:scale-98 hover:border-teal-400"
              style={{ borderColor: "#e5e7eb" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0d9488"; (e.currentTarget as HTMLButtonElement).style.background = "#f0fdfa"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-teal-500 flex items-center justify-center flex-shrink-0" />
                <span className="font-semibold text-gray-800">{v.label}</span>
              </div>
              <span className="font-black text-teal-700 text-base">{formatINR(v.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
