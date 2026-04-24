import { formatINR } from "@/lib/utils";
import { adminDb } from "@/lib/firebase-admin";

export const revalidate = 0;

export default async function PaymentsPage() {
  const snap = await adminDb.collection("payments").orderBy("createdAt", "desc").limit(100).get();
  const payments = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string; orderNumber: string; customerName: string; amount: number;
    method?: string; status: string; createdAt: string;
  }[];

  const STATUS_COLORS: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Order</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Method</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-sm text-gray-800">{p.orderNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.customerName}</td>
                <td className="px-4 py-3 font-bold text-teal-700">{formatINR(p.amount)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{p.method ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div className="text-center py-10 text-gray-400">No payments yet</div>}
      </div>
    </div>
  );
}
