import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  user?: { name: string; email: string; phone: string | null };
  status: OrderStatus;
  orderType: OrderType;
  tableNumber?: string | null;
  deliveryAddress?: string | null;
  specialInstructions?: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  packagingFee: number;
  total: number;
  etaMinutes?: number;
  etaSetAt?: string;
  createdAt: string;
  confirmedAt?: string;
  readyAt?: string;
  completedAt?: string;
  payment?: { status: string; method?: string };
}

export async function getOrdersByUser(uid: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("userId", "==", uid)
    .get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  return orders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getLiveOrders(): Promise<Order[]> {
  // Sort in-memory to avoid needing a composite Firestore index
  const snap = await adminDb
    .collection("orders")
    .where("status", "in", ["NEW", "CONFIRMED", "PREPARING", "READY"])
    .get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  return orders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTodayOrders(): Promise<Order[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const snap = await adminDb
    .collection("orders")
    .where("createdAt", ">=", today.toISOString())
    .get();
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  return orders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createOrder(data: Omit<Order, "id">): Promise<string> {
  const ref = await adminDb.collection("orders").add({
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extra?: Record<string, unknown>
) {
  await adminDb.collection("orders").doc(orderId).update({
    status,
    ...extra,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
