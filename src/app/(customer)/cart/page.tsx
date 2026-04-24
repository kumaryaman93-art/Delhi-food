"use client";

import { useCartStore } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { Trash2, ShoppingBag, Minus, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GST_RATE = 0.05;
const PACKAGING_FEE = 20;

export default function CartPage() {
  const router = useRouter();
  const {
    items, updateQuantity, removeItem,
    orderType, setOrderType,
    tableNumber, setTableNumber,
    specialInstructions, setSpecialInstructions,
    subtotal,
  } = useCartStore();

  const sub = subtotal();
  const tax = parseFloat((sub * GST_RATE).toFixed(2));
  const total = sub + tax + (orderType !== "DINE_IN" ? PACKAGING_FEE : 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add some delicious dishes to get started!</p>
        <Link href="/menu"
          className="px-8 py-3 rounded-full font-semibold text-white"
          style={{ background: "#0d9488" }}>
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 fade-in">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Your Cart</h1>

      {/* Desktop: side-by-side | Mobile: single column */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Items + Order type + Instructions ── */}
        <div className="flex-1 space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64}
                    unoptimized className="w-14 h-14 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0 ${item.isVeg ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"}`} />
                    <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                  </div>
                  {item.variant && (
                    <span className="inline-block text-xs px-1.5 py-0.5 rounded mb-0.5 font-medium"
                      style={{ background: "#f0fdfa", color: "#0f766e" }}>{item.variant}</span>
                  )}
                  <p className="text-teal-700 font-bold text-sm">{formatINR(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                    style={{ background: "#0d9488" }}>
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-1 text-gray-300 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order type */}
          <div className="p-4 rounded-xl" style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <h3 className="font-semibold text-gray-700 mb-3">Order Type</h3>
            <div className="flex gap-2">
              {(["DINE_IN", "TAKEAWAY"] as const).map((type) => (
                <button key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    orderType === type ? "text-white" : "bg-gray-100 text-gray-600"
                  }`}
                  style={orderType === type ? { background: "#0d9488" } : {}}>
                  {type === "DINE_IN" ? "🪑 Dine In" : "🛍️ Takeaway"}
                </button>
              ))}
            </div>
            {orderType === "DINE_IN" && (
              <input
                type="text"
                placeholder="Table number (optional)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400"
              />
            )}
          </div>

          {/* Special instructions */}
          <div className="p-4 rounded-xl" style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
            <h3 className="font-semibold text-gray-700 mb-2">Special Instructions</h3>
            <textarea
              placeholder="Any special requests? (e.g., less spicy, extra sauce)"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{specialInstructions.length}/500</p>
          </div>
        </div>

        {/* ── RIGHT: Order summary + Pay button ── */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="p-5 rounded-2xl space-y-3"
              style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <h3 className="font-bold text-gray-800 text-base mb-4">Order Summary</h3>

              {/* Item list in summary */}
              <div className="space-y-1.5 pb-3 border-b border-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                    <span className="flex-shrink-0 font-medium">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>{formatINR(sub)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (5%)</span><span>{formatINR(tax)}</span>
                </div>
                {orderType !== "DINE_IN" && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Packaging</span><span>{formatINR(PACKAGING_FEE)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-teal-700">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-lg transition-transform active:scale-95"
              style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)", boxShadow: "0 4px 20px rgba(13,148,136,0.35)" }}
            >
              Proceed to Pay {formatINR(total)} <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-center text-gray-400">
              🔒 Secure payment via Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
