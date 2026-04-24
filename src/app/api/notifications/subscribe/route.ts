import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fcmToken } = await req.json();

  await adminDb.collection("users").doc(session.uid).set(
    { fcmToken, updatedAt: new Date() },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
