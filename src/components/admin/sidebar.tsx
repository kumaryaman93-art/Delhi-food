"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, Users, CreditCard, BarChart3, Settings, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="w-56 min-h-screen flex flex-col py-6 border-r border-gray-200"
      style={{ background: "white" }}>
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">Delhi Food</p>
            <p className="text-teal-600 text-xs font-medium">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
              style={isActive ? { background: "#0d9488" } : {}}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
