"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils";
import { Phone, MessageCircle, Clock, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PREPARING: "bg-purple-100 text-purple-700 border-purple-200",
  READY: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
};

const NEXT_STATUS: Record<string, string> = {
  NEW: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

const NEXT_LABEL: Record<string, string> = {
  NEW: "Confirm Order",
  CONFIRMED: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Mark Complete",
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  tableNumber?: string | null;
  total: number;
  createdAt: string;
  etaMinutes?: number | null;
  items: { name: string; quantity: number }[];
  userName?: string;
  user?: { name: string; email: string; phone: string | null };
  payment?: { status: string; method?: string | null } | null;
}

export default function AdminOrderCard({ order }: { order: Order }) {
  const [eta, setEta] = useState("");
  const [updating, setUpdating] = useState(false);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    // No router.refresh() — onSnapshot auto-updates the list
    setUpdating(false);
  }

  async function setEtaAndNotify() {
    if (!eta) return;
    setUpdating(true);
    await fetch(`/api/admin/orders/${order.id}/eta`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etaMinutes: parseInt(eta) }),
    });
    setUpdating(false);
    setEta("");
  }

  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">{order.orderNumber}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.orderType.replace("_", " ")} ·{" "}
              {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {order.tableNumber && ` · Table ${order.tableNumber}`}
            </p>
          </div>
          <span className="font-bold text-teal-700 text-lg">{formatINR(order.total)}</span>
        </div>

        {/* Customer */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-medium text-sm text-gray-700">{order.user?.name ?? order.userName ?? "Guest"}</p>
            {order.user?.phone && (
              <p className="text-xs text-gray-500">{order.user.phone}</p>
            )}
          </div>
          <div className="flex gap-2">
            {order.user?.phone && (
              <a href={`tel:${order.user.phone}`}
                className="p-2 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100">
                <Phone className="w-4 h-4" />
              </a>
            )}
            {order.user?.phone && (
              <a href={`https://wa.me/91${order.user.phone.replace(/\D/g, "")}`} target="_blank"
                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="text-xs text-gray-500 mb-3">
          {order.items.map((i) => `${i.name} ×${i.quantity}`).join(" · ")}
        </div>

        {/* ETA */}
        {(order.status === "CONFIRMED" || order.status === "PREPARING") && (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              placeholder="ETA (minutes)"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={setEtaAndNotify}
              disabled={!eta || updating}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "#d97706" }}
            >
              <Clock className="w-3 h-3" /> Set ETA
            </button>
          </div>
        )}

        {/* Actions */}
        {nextStatus && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={updating}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-70"
            style={{ background: "#0d9488" }}
          >
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            {NEXT_LABEL[order.status]}
          </button>
        )}
      </div>
    </div>
  );
}
