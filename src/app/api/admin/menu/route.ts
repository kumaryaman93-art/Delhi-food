import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [catSnap, itemsSnap] = await Promise.all([
    adminDb.collection("categories").orderBy("displayOrder").get(),
    adminDb.collection("menuItems").orderBy("displayOrder").get(),
  ]);

  const categories = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const items = itemsSnap.docs.map((d) => {
    const data = d.data();
    const cat = categories.find((c) => c.id === data.categoryId) as { name: string; emoji: string } | undefined;
    return {
      id: d.id,
      ...data,
      price: Number(data.price),
      category: cat ? { name: cat.name, emoji: cat.emoji } : { name: "", emoji: "" },
    };
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const ref = await adminDb.collection("menuItems").add({
    categoryId: body.categoryId,
    name: body.name,
    description: body.description ?? "",
    price: Number(body.price),
    imageUrl: body.imageUrl ?? null,
    isVeg: body.isVeg ?? true,
    isAvailable: body.isAvailable ?? true,
    isFeatured: body.isFeatured ?? false,
    isNew: body.isNew ?? false,
    displayOrder: body.displayOrder ?? 999,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ id: ref.id }, { status: 201 });
}
