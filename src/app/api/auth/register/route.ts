import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const { name, email, phone, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  try {
    await adminAuth.getUserByEmail(email);
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  } catch {
    // User doesn't exist — proceed
  }

  await adminAuth.createUser({ email, password, displayName: name, phoneNumber: phone || undefined });

  return NextResponse.json({ success: true }, { status: 201 });
}
