import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type OrderStatus = "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  variant?: string | null;
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

type FirestoreOrderData = Record<string, unknown>;

function toIsoString(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const raw = item as Record<string, unknown>;
    const price = toNumber(raw.price);
    const quantity = toNumber(raw.quantity);

    return {
      id: String(raw.id ?? raw.menuItemId ?? ""),
      menuItemId: String(raw.menuItemId ?? raw.id ?? ""),
      name: String(raw.name ?? "Item"),
      variant: raw.variant === undefined ? null : String(raw.variant),
      price,
      quantity,
      total: toNumber(raw.total, price * quantity),
    };
  });
}

export function normalizeOrderDocument(id: string, data: FirestoreOrderData): Order {
  const createdAt = toIsoString(data.createdAt) ?? new Date(0).toISOString();

  return {
    id,
    orderNumber: String(data.orderNumber ?? id.slice(-6).toUpperCase()),
    userId: String(data.userId ?? ""),
    userName: String(data.userName ?? ""),
    userEmail: String(data.userEmail ?? ""),
    userPhone: data.userPhone ? String(data.userPhone) : undefined,
    user: data.user as Order["user"],
    status: (data.status as OrderStatus) ?? "NEW",
    orderType: (data.orderType as OrderType) ?? "TAKEAWAY",
    tableNumber: data.tableNumber ? String(data.tableNumber) : null,
    deliveryAddress: data.deliveryAddress ? String(data.deliveryAddress) : null,
    specialInstructions: data.specialInstructions ? String(data.specialInstructions) : null,
    items: normalizeItems(data.items),
    subtotal: toNumber(data.subtotal),
    tax: toNumber(data.tax),
    packagingFee: toNumber(data.packagingFee),
    total: toNumber(data.total),
    etaMinutes: typeof data.etaMinutes === "number" ? data.etaMinutes : undefined,
    etaSetAt: toIsoString(data.etaSetAt) ?? undefined,
    createdAt,
    confirmedAt: toIsoString(data.confirmedAt) ?? undefined,
    readyAt: toIsoString(data.readyAt) ?? undefined,
    completedAt: toIsoString(data.completedAt) ?? undefined,
    payment: data.payment as Order["payment"],
  };
}

export async function getOrdersByUser(uid: string): Promise<Order[]> {
  const snap = await adminDb
    .collection("orders")
    .where("userId", "==", uid)
    .get();
  const orders = snap.docs.map((d) => normalizeOrderDocument(d.id, d.data()));
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
  const orders = snap.docs.map((d) => normalizeOrderDocument(d.id, d.data()));
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
  const orders = snap.docs.map((d) => normalizeOrderDocument(d.id, d.data()));
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
