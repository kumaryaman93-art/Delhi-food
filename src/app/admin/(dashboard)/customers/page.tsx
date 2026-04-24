import { Phone, MessageCircle } from "lucide-react";
import { adminDb } from "@/lib/firebase-admin";

export const revalidate = 0;

export default async function CustomersPage() {
  // No orderBy — sort in-memory so missing createdAt field doesn't crash the query
  const snap = await adminDb.collection("users").get();
  const customers = (snap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string; name: string; email: string; phone?: string;
    orderCount?: number; lastOrderAt?: string; createdAt?: string;
  }[]).sort((a, b) =>
    (b.lastOrderAt ?? b.createdAt ?? "").localeCompare(a.lastOrderAt ?? a.createdAt ?? "")
  );

  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Customers ({customers.length})</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Orders</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Last Order</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                  {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-700">{c.orderCount ?? 0}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.phone && (
                      <>
                        <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/91${c.phone.replace(/\D/g, "")}`} target="_blank"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <div className="text-center py-10 text-gray-400">No customers yet</div>}
      </div>
    </div>
  );
}
