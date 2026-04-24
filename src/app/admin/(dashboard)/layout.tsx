import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import AdminSidebar from "@/components/admin/sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen flex" style={{ background: "#f8fafc" }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
