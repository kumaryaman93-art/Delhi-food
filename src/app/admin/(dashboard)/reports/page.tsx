import { formatINR } from "@/lib/utils";
import { getTodayOrders } from "@/lib/firestore/orders";

export const revalidate = 0;

export default async function ReportsPage() {
  const todayOrders = await getTodayOrders();

  const revenue = todayOrders
    .filter((o) => o.payment?.status === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  const methodBreakdown = todayOrders.reduce((acc: Record<string, number>, o) => {
    const method = o.payment?.method ?? "unknown";
    acc[method] = (acc[method] ?? 0) + 1;
    return acc;
  }, {});

  const itemCounts: Record<string, number> = {};
  todayOrders.forEach((o) =>
    o.items?.forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] ?? 0) + i.quantity;
    })
  );
  const topItems = Object.entries(itemCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-700 mb-4">Today&apos;s Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl font-bold text-teal-700">{todayOrders.length}</p></div>
          <div><p className="text-xs text-gray-500">Revenue</p><p className="text-2xl font-bold text-amber-600">{formatINR(revenue)}</p></div>
          <div><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{todayOrders.filter((o) => o.status === "COMPLETED").length}</p></div>
          <div><p className="text-xs text-gray-500">Avg Order</p><p className="text-2xl font-bold text-purple-600">{todayOrders.length > 0 ? formatINR(revenue / todayOrders.length) : "₹0"}</p></div>
        </div>
      </div>

      {topItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4">Top Items Today</h2>
          <div className="space-y-2">
            {topItems.map(([name, count], idx) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{name}</span>
                    <span className="font-medium text-gray-800">{count} sold</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ background: "#0d9488", width: `${(count / topItems[0][1]) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(methodBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4">Payment Methods</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(methodBreakdown).map(([method, count]) => (
              <div key={method} className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 capitalize">{method}</p>
                <p className="font-bold text-gray-800">{count} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {todayOrders.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No orders today yet</p>
        </div>
      )}
    </div>
  );
}
