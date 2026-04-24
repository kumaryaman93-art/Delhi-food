"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils";
import { Plus, Edit2, ToggleLeft, ToggleRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  emoji: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: { name: string; emoji: string | null };
}

export default function AdminMenuClient({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const filtered = selectedCat === "all" ? items : items.filter((i) => i.categoryId === selectedCat);

  async function toggleAvailability(id: string, current: boolean) {
    await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !current }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: "#0d9488" }}
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setSelectedCat("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCat === "all" ? "text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
          style={selectedCat === "all" ? { background: "#0d9488" } : {}}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCat === cat.id ? "text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
            style={selectedCat === cat.id ? { background: "#0d9488" } : {}}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Item</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Price</th>
              <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Available</th>
              <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0 ${
                      item.isVeg ? "bg-green-500 border-green-700" : "bg-red-500 border-red-700"
                    }`} />
                    <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                    {item.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.category.emoji} {item.category.name}
                </td>
                <td className="px-4 py-3 font-semibold text-teal-700 text-sm">{formatINR(item.price)}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleAvailability(item.id, item.isAvailable)}>
                    {item.isAvailable ? (
                      <ToggleRight className="w-6 h-6 text-teal-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-300" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">No items in this category</div>
        )}
      </div>
    </div>
  );
}
