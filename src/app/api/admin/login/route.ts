import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

// Admin emails: ADMIN_EMAILS env var (comma-separated) OR hardcoded fallback.
const HARDCODED_ADMIN_EMAILS = ["admin@delhifood.com"];

function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const fromEnv = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const allowed = fromEnv.length > 0 ? fromEnv : HARDCODED_ADMIN_EMAILS;
  return allowed.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "ID token required" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.email || !isAdminEmail(decoded.email)) {
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
