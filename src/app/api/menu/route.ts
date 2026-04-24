import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  // Convert Decimal to number for JSON serialization
  const data = categories.map((cat) => ({
    ...cat,
    items: cat.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));

  return NextResponse.json(data);
}
