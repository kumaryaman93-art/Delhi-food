"use client";

// Firebase Auth is used instead of NextAuth — no session provider wrapper needed
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
