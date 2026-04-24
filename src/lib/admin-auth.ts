import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

export interface AdminJwtPayload {
  adminId: string;
  email: string;
}

export function signAdminToken(payload: AdminJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest): AdminJwtPayload | null {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function requireAdmin(
  handler: (req: NextRequest, admin: AdminJwtPayload) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, admin);
  };
}
