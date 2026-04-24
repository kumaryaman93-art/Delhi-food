"use client";

import { useCallback, useState } from "react";
import { useLiveOrders } from "@/hooks/use-live-orders";
import AdminOrderCard from "@/components/admin/order-card";
import SoundToggle from "@/components/admin/sound-toggle";
import { Wifi } from "lucide-react";

export default function LiveOrdersList() {
  const [newOrderSignal, setNewOrderSignal] = useState(0);
  const [flash, setFlash] = useState(false);

  const handleNewOrder = useCallback(() => {
    setNewOrderSignal((n) => n + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
  }, []);

  const { orders, loading, error } = useLiveOrders(handleNewOrder);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-700">
            Live Orders{" "}
            {orders.length > 0 && (
              <span
                className={`text-teal-500 transition-all duration-300 ${flash ? "text-amber-500 scale-110" : ""}`}>
                ({orders.length})
              </span>
            )}
          </h2>
          {/* Live indicator */}
          <span className="flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Live
          </span>
        </div>
        <SoundToggle newOrderSignal={newOrderSignal} />
      </div>

      {error ? (
        <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100 text-red-500">
          <p className="font-medium text-sm">⚠️ Could not load orders</p>
          <p className="text-xs mt-1 text-red-400">{error}</p>
        </div>
      ) : loading ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Connecting to live orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-medium">No active orders</p>
          <p className="text-xs mt-1 flex items-center justify-center gap-1">
            <Wifi className="w-3 h-3" /> Watching for new orders…
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
