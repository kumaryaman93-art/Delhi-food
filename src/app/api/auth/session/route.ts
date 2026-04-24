import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const sessionCookie = await createSession(idToken);

    const res = NextResponse.json({ status: "ok" });
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("Session creation error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
