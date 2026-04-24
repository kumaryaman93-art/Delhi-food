"use client";

import { useLiveOrder } from "@/hooks/use-live-order";
import OrderTrackingPage from "./order-tracking";

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
  confirmedAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
  items: { id: string; name: string; quantity: number; price: number; total: number }[];
  payment: { status: string; method: string | null } | null;
}

interface Props {
  order: Order;
  isSuccess: boolean;
}

export default function OrderTrackingLive({ order: initialOrder, isSuccess }: Props) {
  // Subscribes to Firestore doc — status updates reflect instantly without refresh
  const order = useLiveOrder(initialOrder);
  return <OrderTrackingPage order={order} isSuccess={isSuccess} />;
}
