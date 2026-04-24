// NextAuth has been replaced by Firebase Auth.
// This route is kept as a stub to avoid 404s from stale browser cache.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
