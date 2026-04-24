import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const item = await prisma.menuItem.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ ...item, price: Number(item.price) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.menuItem.update({
    where: { id: params.id },
    data: { isAvailable: false },
  });

  return NextResponse.json({ success: true });
}
