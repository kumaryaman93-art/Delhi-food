import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await adminDb.collection("menuItems").doc(params.id).update({
    ...body,
    price: body.price !== undefined ? Number(body.price) : undefined,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await adminDb.collection("menuItems").doc(params.id).update({
    isAvailable: false,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
