"use client";

import { useEffect, useRef, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export interface LiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  tableNumber?: string | null;
  total: number;
  createdAt: string;
  etaMinutes?: number | null;
  items: { name: string; quantity: number; price: number }[];
  userName?: string;
  user?: { name: string; email: string; phone: string | null };
  payment?: { status: string; method?: string | null } | null;
  userId: string;
}

function toIso(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  // Firestore Timestamp
  if (val && typeof (val as { toDate?: () => Date }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function docToOrder(d: { id: string; data: () => Record<string, unknown> }): LiveOrder {
  const data = d.data();
  return {
    id: d.id,
    orderNumber: (data.orderNumber as string) ?? d.id.slice(-6).toUpperCase(),
    status: (data.status as string) ?? "NEW",
    orderType: (data.orderType as string) ?? "DINE_IN",
    tableNumber: (data.tableNumber as string | null) ?? null,
    total: Number(data.total ?? 0),
    createdAt: toIso(data.createdAt),
    etaMinutes: (data.etaMinutes as number | null) ?? null,
    items: ((data.items as { name: string; quantity: number; price: number }[]) ?? []),
    userName: (data.userName as string) ?? "",
    user: data.user as LiveOrder["user"],
    payment: data.payment as LiveOrder["payment"],
    userId: (data.userId as string) ?? "",
  };
}

export function useLiveOrders(onNewOrder?: () => void) {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    // Wait for Firebase Auth to restore session before subscribing.
    // Without this, onSnapshot fires before auth is ready → rules see
    // request.auth == null → permission-denied → infinite loading.
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up any previous snapshot listener
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (!user) {
        setOrders([]);
        setLoading(false);
        setError("Not signed in");
        return;
      }

      // No orderBy — sort in-memory to avoid needing a composite Firestore index
      const q = query(
        collection(db, "orders"),
        where("status", "in", ["NEW", "CONFIRMED", "PREPARING", "READY"])
      );

      unsubSnapshot = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs
            .map((d) => docToOrder(d as Parameters<typeof docToOrder>[0]))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const newIds = new Set(docs.map((d) => d.id));

          if (prevIdsRef.current.size > 0) {
            const arrivals = docs.filter((d) => !prevIdsRef.current.has(d.id));
            if (arrivals.length > 0) onNewOrderRef.current?.();
          }

          prevIdsRef.current = newIds;
          setOrders(docs);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("useLiveOrders snapshot error:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  return { orders, loading, error };
}
