import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { etaMinutes } = await req.json();
  await adminDb.collection("orders").doc(params.id).update({
    etaMinutes: Number(etaMinutes),
    etaSetAt: new Date().toISOString(),
  });
  return NextResponse.json({ success: true });
}
