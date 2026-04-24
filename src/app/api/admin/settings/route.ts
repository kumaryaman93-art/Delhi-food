import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { getSettings, updateSettings } from "@/lib/firestore/settings";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  await updateSettings(data);
  return NextResponse.json({ success: true });
}
