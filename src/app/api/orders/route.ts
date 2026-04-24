import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { getSettings } from "@/lib/firestore/settings";
import { getOrdersByUser } from "@/lib/firestore/orders";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { items, orderType, tableNumber, deliveryAddress, specialInstructions, paymentId } = body;

  const settings = await getSettings();
  const gstRate = settings.gstRate / 100;
  const packagingFee = orderType === "DINE_IN" ? 0 : settings.packagingFee;

  const subtotal = items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0
  );
  const tax = parseFloat((subtotal * gstRate).toFixed(2));
  const total = parseFloat((subtotal + tax + packagingFee).toFixed(2));
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  const orderData = {
    orderNumber,
    userId: session.uid,
    userName: session.name ?? "",
    userEmail: session.email ?? "",
    status: "NEW",
    orderType,
    tableNumber: tableNumber || null,
    deliveryAddress: deliveryAddress || null,
    specialInstructions: specialInstructions || null,
    items: items.map((item: { id: string; itemId?: string; name: string; price: number; quantity: number; variant?: string }) => ({
      id: item.itemId ?? item.id,
      menuItemId: item.itemId ?? item.id,
      name: item.name,
      variant: item.variant ?? null,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    })),
    subtotal,
    tax,
    packagingFee,
    total,
    createdAt: now,
    confirmedAt: null,
    readyAt: null,
    completedAt: null,
    etaMinutes: null,
    etaSetAt: null,
    payment: paymentId ? { status: "PAID", method: "RAZORPAY", razorpayPaymentId: paymentId } : { status: "PENDING", method: null },
  };

  const ref = await adminDb.collection("orders").add(orderData);

  // Save payment record
  if (paymentId) {
    await adminDb.collection("payments").add({
      orderId: ref.id,
      orderNumber,
      customerName: session.name ?? "",
      customerEmail: session.email ?? "",
      amount: total,
      method: "RAZORPAY",
      status: "PAID",
      razorpayPaymentId: paymentId,
      createdAt: now,
    });
  }

  // Update user order stats
  await adminDb.collection("users").doc(session.uid).set({
    name: session.name,
    email: session.email,
    lastOrderAt: now,
  }, { merge: true });

  await adminDb.collection("users").doc(session.uid).update({
    orderCount: (await adminDb.collection("users").doc(session.uid).get()).data()?.orderCount + 1 || 1,
  });

  return NextResponse.json({ id: ref.id, ...orderData }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await getOrdersByUser(session.uid);
  return NextResponse.json(orders);
}
