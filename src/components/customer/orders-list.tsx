"use client";

import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-purple-100 text-purple-700",
  READY: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Order Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready!",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <ClipboardList className="w-20 h-20 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
        <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
        <Link href="/menu"
          className="px-8 py-3 rounded-full font-semibold text-white"
          style={{ background: "#0d9488" }}>
          Order Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 fade-in">
      <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="block p-4 rounded-xl transition-transform active:scale-98"
          style={{ background: "white", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800">{order.orderNumber}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
            <span className="font-bold text-teal-700">{formatINR(order.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
