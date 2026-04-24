import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "ID token required" }, { status: 400 });
  }

  try {
    // Verify the token and check admin claim
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Not an admin account" }, { status: 403 });
    }

    const sessionCookie = await createSession(idToken);
    const res = NextResponse.json({ success: true, name: decoded.name });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, SESSION_COOKIE_OPTIONS);
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}
