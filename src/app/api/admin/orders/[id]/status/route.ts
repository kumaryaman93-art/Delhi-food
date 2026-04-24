import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { updateOrderStatus, OrderStatus } from "@/lib/firestore/orders";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  const now = new Date().toISOString();

  const extra: Record<string, string> = {};
  if (status === "CONFIRMED") extra.confirmedAt = now;
  if (status === "READY") extra.readyAt = now;
  if (status === "COMPLETED") extra.completedAt = now;

  await updateOrderStatus(params.id, status as OrderStatus, extra);
  return NextResponse.json({ success: true });
}
