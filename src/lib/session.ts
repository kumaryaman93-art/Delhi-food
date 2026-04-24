import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE = "dfj_session";
const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000; // 5 days in ms

export async function createSession(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION,
  });
  return sessionCookie;
}

export async function getSession() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded;
  } catch {
    return null;
  }
}

const HARDCODED_ADMIN_EMAILS = ["admin@delhifood.com"];

function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const fromEnv = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const allowed = fromEnv.length > 0 ? fromEnv : HARDCODED_ADMIN_EMAILS;
  return allowed.includes(email.toLowerCase());
}

export async function getAdminSession() {
  const session = await getSession();
  if (!session || !session.email) return null;
  if (!isAdminEmail(session.email)) return null;
  return session;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_OPTIONS = {
  maxAge: SESSION_DURATION / 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax" as const,
};
