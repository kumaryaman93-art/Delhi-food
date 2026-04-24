export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrdersByUser } from "@/lib/firestore/orders";
import OrdersList from "@/components/customer/orders-list";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=/orders");

  const orders = await getOrdersByUser(session.uid);
  return <OrdersList orders={orders} />;
}
