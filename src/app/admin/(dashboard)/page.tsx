import { formatINR } from "@/lib/utils";
import { getTodayOrders } from "@/lib/firestore/orders";
import LiveOrdersList from "@/components/admin/live-orders-list";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const todayOrders = await getTodayOrders();

  const todayRevenue = todayOrders
    .filter((o) => o.payment?.status === "PAID")
    .reduce((sum, o) => sum + o.total, 0);
  const completedToday = todayOrders.filter((o) => o.status === "COMPLETED").length;
  const pendingCount = todayOrders.filter((o) =>
    ["NEW", "CONFIRMED", "PREPARING"].includes(o.status)
  ).length;

  const stats = [
    { label: "Today's Orders", value: todayOrders.length, color: "#0d9488" },
    { label: "Today's Revenue", value: formatINR(todayRevenue), color: "#d97706" },
    { label: "Pending", value: pendingCount, color: "#7c3aed" },
    { label: "Completed Today", value: completedToday, color: "#16a34a" },
  ];

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Live Dashboard</h1>

      {/* Stats — SSR (today's totals, no realtime needed) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Live orders — client component with onSnapshot */}
      <LiveOrdersList />
    </div>
  );
}
