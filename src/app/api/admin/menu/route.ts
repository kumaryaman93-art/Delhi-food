import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.menuItem.findMany({
    orderBy: [{ categoryId: "asc" }, { displayOrder: "asc" }],
    include: { category: { select: { name: true, emoji: true } } },
  });

  return NextResponse.json(items.map((i) => ({ ...i, price: Number(i.price) })));
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.menuItem.create({
    data: {
      categoryId: body.categoryId,
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      isVeg: body.isVeg ?? true,
      isAvailable: body.isAvailable ?? true,
      isFeatured: body.isFeatured ?? false,
      isNew: body.isNew ?? false,
    },
  });

  return NextResponse.json({ ...item, price: Number(item.price) }, { status: 201 });
}
