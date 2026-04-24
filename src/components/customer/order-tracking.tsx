"use client";

import { formatINR } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, Clock, ChefHat, Bell, Package } from "lucide-react";

const STATUSES = [
  { key: "NEW", label: "Order Placed", icon: Package, desc: "We've received your order!" },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle, desc: "Your order is confirmed" },
  { key: "PREPARING", label: "Preparing", icon: ChefHat, desc: "Our chefs are working on it" },
  { key: "READY", label: "Ready!", icon: Bell, desc: "Your order is ready!" },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle, desc: "Enjoy your meal!" },
];

const STATUS_ORDER = ["NEW", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  tableNumber: string | null;
  total: number;
  etaMinutes: number | null;
  etaSetAt: string | null;
  createdAt: string;
  items: { id: string; name: string; quantity: number; price: number; total: number }[];
  payment: { status: string; method: string | null } | null;
}

export default function OrderTrackingPage({ order, isSuccess }: { order: Order; isSuccess: boolean }) {
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 fade-in">
      {isSuccess && (
        <div className="flex flex-col items-center py-6 rounded-2xl text-center"
          style={{ background: "linear-gradient(135deg, #0d9488, #0f766e)" }}>
          <div className="text-6xl mb-3">✅</div>
          <h2 className="text-white text-2xl font-bold mb-1">Payment Successful!</h2>
          <p className="text-teal-100 text-sm">Your order has been placed</p>
        </div>
      )}

      <div className="p-4 rounded-xl" style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{order.orderNumber}</h2>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          {order.etaMinutes && order.status !== "READY" && order.status !== "COMPLETED" && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">~{order.etaMinutes} min</span>
            </div>
          )}
        </div>

        {/* Status timeline */}
        <div className="space-y-0">
          {STATUSES.filter((s) => s.key !== "CANCELLED").map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? "bg-teal-500" : isActive ? "bg-teal-500 ring-4 ring-teal-100" : "bg-gray-100"
                  }`}>
                    <Icon className={`w-4 h-4 ${isCompleted || isActive ? "text-white" : "text-gray-400"}`} />
                  </div>
                  {idx < STATUSES.length - 2 && (
                    <div className={`w-0.5 h-8 ${idx < currentIdx ? "bg-teal-500" : "bg-gray-100"}`} />
                  )}
                </div>
                <div className="pb-4 flex-1">
                  <p className={`font-medium text-sm ${isActive ? "text-teal-700" : isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  {(isActive || isCompleted) && (
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items */}
      <div className="p-4 rounded-xl" style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
        <h3 className="font-semibold text-gray-700 mb-3">Items Ordered</h3>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-600">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatINR(item.total)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span className="text-teal-700">{formatINR(order.total)}</span>
          </div>
        </div>
      </div>

      <Link href="/orders"
        className="block text-center py-3 rounded-xl text-teal-700 font-medium border border-teal-200 bg-teal-50">
        ← Back to My Orders
      </Link>
    </div>
  );
}
