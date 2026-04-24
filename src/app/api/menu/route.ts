import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const [catSnap, itemsSnap] = await Promise.all([
    adminDb.collection("categories").where("isActive", "!=", false).orderBy("isActive").orderBy("displayOrder").get(),
    adminDb.collection("menuItems").where("isAvailable", "==", true).orderBy("displayOrder").get(),
  ]);

  type Item = Record<string, unknown> & { id: string; price: number; categoryId?: string };
  const categories = catSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));
  const items: Item[] = itemsSnap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return { id: d.id, ...data, price: Number(data.price) };
  });

  const data = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.categoryId === cat.id),
  }));

  return NextResponse.json(data);
}
