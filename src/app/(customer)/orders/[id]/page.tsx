export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { notFound, redirect } from "next/navigation";
import OrderTrackingLive from "@/components/customer/order-tracking-live";
import { normalizeOrderDocument } from "@/lib/firestore/orders";

export default async function OrderDetailPage({ params, searchParams }: {
  params: { id: string };
  searchParams: { success?: string };
}) {
  const session = await getSession();
  if (!session) redirect(`/login?returnTo=/orders/${params.id}`);

  const orderDoc = await adminDb.collection("orders").doc(params.id).get();
  if (!orderDoc.exists) notFound();

  const data = orderDoc.data()!;
  // Ensure this order belongs to the logged-in user
  if (data.userId !== session.uid) notFound();

  const normalizedOrder = normalizeOrderDocument(orderDoc.id, data);
  const payment = normalizedOrder.payment
    ? {
        status: normalizedOrder.payment.status,
        method: normalizedOrder.payment.method ?? null,
        paidAt: normalizedOrder.createdAt,
        createdAt: normalizedOrder.createdAt,
      }
    : null;

  const order = {
    ...normalizedOrder,
    tableNumber: normalizedOrder.tableNumber ?? null,
    deliveryAddress: normalizedOrder.deliveryAddress ?? null,
    specialInstructions: normalizedOrder.specialInstructions ?? null,
    etaMinutes: normalizedOrder.etaMinutes ?? null,
    etaSetAt: normalizedOrder.etaSetAt ?? null,
    confirmedAt: normalizedOrder.confirmedAt ?? null,
    readyAt: normalizedOrder.readyAt ?? null,
    completedAt: normalizedOrder.completedAt ?? null,
    payment,
    user: { name: session.name ?? "", email: session.email ?? "", phone: null },
  };

  return <OrderTrackingLive order={order} isSuccess={searchParams.success === "true"} />;
}
