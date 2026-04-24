"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  theme: { color: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open(): void;
}

const GST_RATE = 0.05;
const PACKAGING_FEE = 20;

interface Props {
  userName: string;
  userEmail: string;
}

export default function CheckoutClient({ userName, userEmail }: Props) {
  const router = useRouter();
  const { items, orderType, tableNumber, deliveryAddress, specialInstructions, subtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sub = subtotal();
  const tax = parseFloat((sub * GST_RATE).toFixed(2));
  const total = sub + tax + (orderType !== "DINE_IN" ? PACKAGING_FEE : 0);

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        });
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const { orderId } = await orderRes.json();

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "Delhi Food Junction",
        description: "Food Order",
        order_id: orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#0d9488" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const { verified, paymentId } = await verifyRes.json();

          if (!verified) {
            setError("Payment verification failed. Please contact support.");
            setLoading(false);
            return;
          }

          const orderCreateRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((i) => ({ id: i.id, itemId: i.itemId, name: i.name, price: i.price, quantity: i.quantity, variant: i.variant ?? null })),
              orderType,
              tableNumber,
              deliveryAddress,
              specialInstructions,
              paymentId,
            }),
          });
          const order = await orderCreateRes.json();
          clearCart();
          router.push(`/orders/${order.id}?success=true`);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch {
      setError("Payment failed. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 fade-in">
      <h1 className="text-xl font-bold text-gray-800">Payment</h1>

      <div className="p-4 rounded-xl space-y-2" style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <h3 className="font-semibold text-gray-700 mb-3">Order Summary</h3>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-gray-600">
            <span className="truncate mr-2">
              {item.name}{item.variant ? ` (${item.variant})` : ""} × {item.quantity}
            </span>
            <span className="flex-shrink-0 font-medium">{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-2 space-y-1">
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
          <div className="flex justify-between font-bold text-gray-800 text-lg pt-1">
            <span>Total</span><span className="text-teal-700">{formatINR(total)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <h3 className="font-semibold text-gray-700 mb-2">Payment Methods</h3>
        <div className="flex gap-3 flex-wrap">
          {["UPI", "Cards", "Net Banking", "Wallets"].map((m) => (
            <span key={m} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">{m}</span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Powered by Razorpay · Secure payment</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white text-lg transition-transform active:scale-95 disabled:opacity-70"
        style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Pay ${formatINR(total)}`}
      </button>
    </div>
  );
}
