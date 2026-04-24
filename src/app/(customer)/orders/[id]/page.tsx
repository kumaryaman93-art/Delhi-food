export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";
import { notFound, redirect } from "next/navigation";
import OrderTrackingLive from "@/components/customer/order-tracking-live";

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

  const order = {
    id: orderDoc.id,
    orderNumber: data.orderNumber ?? orderDoc.id.slice(-6).toUpperCase(),
    status: data.status,
    orderType: data.orderType,
    tableNumber: data.tableNumber ?? null,
    deliveryAddress: data.deliveryAddress ?? null,
    specialInstructions: data.specialInstructions ?? null,
    subtotal: data.subtotal ?? 0,
    tax: data.tax ?? 0,
    packagingFee: data.packagingFee ?? 0,
    total: data.total ?? 0,
    etaMinutes: data.etaMinutes ?? null,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() ?? null,
    readyAt: data.readyAt?.toDate?.()?.toISOString() ?? null,
    completedAt: data.completedAt?.toDate?.()?.toISOString() ?? null,
    etaSetAt: data.etaSetAt?.toDate?.()?.toISOString() ?? null,
    items: (data.items ?? []).map((i: Record<string, unknown>) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      total: (i.price as number) * (i.quantity as number),
    })),
    payment: data.paymentId ? {
      id: data.paymentId,
      amount: data.total,
      status: "PAID",
      method: null,
      paidAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    } : null,
    user: { name: session.name ?? "", email: session.email ?? "", phone: null },
  };

  return <OrderTrackingLive order={order} isSuccess={searchParams.success === "true"} />;
}
