"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, LogOut, ClipboardList, LayoutDashboard } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

interface Props {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isAdmin?: boolean;
}

export default function CustomerHeader({ user, isAdmin }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/home");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 transition-all"
      style={{
        background: "rgba(13, 148, 136, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="text-white font-bold text-lg leading-tight">
            Delhi Food<br />
            <span className="text-teal-200 text-sm font-medium">Junction</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-2">
            <ShoppingCart className="w-6 h-6 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-bold flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Logged in: avatar + dropdown. Logged out: Login button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    width={32}
                    height={32}
                    unoptimized
                    className="rounded-full border-2 border-teal-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <Menu className="w-4 h-4 text-teal-100" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-12 w-48 rounded-xl py-2 z-50"
                  style={{
                    background: "white",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-sm text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                      style={{ color: "#0d9488", background: "rgba(13,148,136,0.06)" }}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ClipboardList className="w-4 h-4" /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
