"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveOrderData {
  status: string;
  etaMinutes: number | null;
  etaSetAt: string | null;
  confirmedAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
}

function toIso(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val && typeof (val as { toDate?: () => Date }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

export function useLiveOrder<T extends { id: string } & LiveOrderData>(
  initialOrder: T
): T {
  const [order, setOrder] = useState<T>(initialOrder);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", initialOrder.id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setOrder((prev) => ({
        ...prev,
        status: (data.status as string) ?? prev.status,
        etaMinutes: (data.etaMinutes as number | null) ?? null,
        etaSetAt: toIso(data.etaSetAt),
        confirmedAt: toIso(data.confirmedAt),
        readyAt: toIso(data.readyAt),
        completedAt: toIso(data.completedAt),
      }));
    });

    return () => unsub();
  }, [initialOrder.id]);

  return order;
}
