"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { MenuVariant } from "@/types";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isFeatured: boolean;
  isNew?: boolean;
  displayOrder: number;
  variants?: MenuVariant[];
}

interface Category {
  id: string;
  name: string;
  emoji: string | null;
  items: MenuItem[];
}

export default function MenuPageClient({ categories }: { categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pillsRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);
  const { addItem, totalItems, subtotal, updateQuantity, getQty } = useCartStore();

  function scrollToCategory(catId: string) {
    setActiveCategory(catId);
    scrollingRef.current = true;
    sectionRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => { scrollingRef.current = false; }, 800);
    const pill = pillsRef.current?.querySelector(`[data-cat="${catId}"]`) as HTMLElement;
    pill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    Object.entries(sectionRefs.current).forEach(([catId, el]) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !scrollingRef.current) {
            setActiveCategory(catId);
            const pill = pillsRef.current?.querySelector(`[data-cat="${catId}"]`) as HTMLElement;
            pill?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          }
        },
        { threshold: 0.2, rootMargin: "-100px 0px -50% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  const filtered = categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchVeg = vegOnly ? item.isVeg : true;
      return matchSearch && matchVeg;
    }),
  })).filter((cat) => cat.items.length > 0);

  const totalCount = filtered.reduce((sum, c) => sum + c.items.length, 0);
  const cartTotal = totalItems();

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── DESKTOP LAYOUT: sidebar + main | MOBILE: single column ── */}
      <div className="flex">

        {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-gray-100 bg-white">
          <div className="p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</p>
            <nav className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all ${
                    activeCategory === cat.id
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={activeCategory === cat.id
                    ? { background: "linear-gradient(90deg, #0d9488, #0f766e)" }
                    : {}}
                >
                  <span className="text-base leading-none flex-shrink-0">{cat.emoji ?? "🍽️"}</span>
                  <span className="truncate">{cat.name}</span>
                  <span className={`ml-auto text-xs flex-shrink-0 ${activeCategory === cat.id ? "text-teal-100" : "text-gray-400"}`}>
                    {cat.items.length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0">

          {/* ── STICKY SEARCH + MOBILE PILLS ── */}
          <div className="sticky top-14 z-40"
            style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}>

            {/* Search row */}
            <div className="px-4 pt-3 pb-2 flex gap-2 max-w-4xl">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "#f1f5f9" }}>
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  vegOnly ? "text-white" : "text-gray-600"
                }`}
                style={vegOnly ? { background: "#16a34a" } : { background: "#f1f5f9" }}>
                <span className={`w-3 h-3 rounded-sm border ${vegOnly ? "bg-white border-white" : "bg-green-500 border-green-700"}`} />
                Veg
              </button>

              {/* Desktop cart button in search bar */}
              {cartTotal > 0 && (
                <Link href="/cart"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}>
                  <ShoppingCart className="w-4 h-4" />
                  {cartTotal} · {formatINR(subtotal())}
                </Link>
              )}
            </div>

            {/* Mobile category pills (hidden on desktop) */}
            <div ref={pillsRef} className="lg:hidden flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    activeCategory === cat.id ? "text-white" : "text-gray-600"
                  }`}
                  style={activeCategory === cat.id
                    ? { background: "linear-gradient(90deg, #0d9488, #0f766e)", boxShadow: "0 2px 8px rgba(13,148,136,0.35)" }
                    : { background: "#f1f5f9" }}>
                  <span>{cat.emoji ?? "🍽️"}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search result count */}
          {search && (
            <div className="px-4 pt-3">
              <p className="text-xs text-gray-500 font-medium">
                {totalCount} {totalCount === 1 ? "dish" : "dishes"} found for &quot;<span className="text-teal-700">{search}</span>&quot;
              </p>
            </div>
          )}

          {/* ── MENU SECTIONS ── */}
          <div className="px-4 pt-4 space-y-10 pb-36">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                ref={(el) => { sectionRefs.current[cat.id] = el; }}
              >
                {/* Category header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #f0fdf4, #d1fae5)" }}>
                    {cat.emoji ?? "🍽️"}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-base leading-tight">{cat.name}</h2>
                    <p className="text-xs text-gray-400">{cat.items.length} items</p>
                  </div>
                </div>

                {/* Items — 1 col mobile, 2 col on md+ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cat.items.map((item) => {
                    const hasVariants = item.variants && item.variants.length > 0;
                    const qty = hasVariants
                      ? (item.variants ?? []).reduce((sum, v) => sum + getQty(item.id, v.label), 0)
                      : getQty(item.id);
                    const minPrice = hasVariants
                      ? Math.min(...(item.variants ?? []).map((v) => v.price))
                      : item.price;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)" }}
                      >
                        {/* ── Top row: image + name/desc ── */}
                        <div className="flex gap-3">
                          {/* Food image */}
                          <div className="relative flex-shrink-0" style={{ width: "88px", height: "88px" }}>
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill unoptimized className="object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl"
                                style={{ background: "linear-gradient(135deg, #f0fdf4, #d1fae5)" }}>🍽️</div>
                            )}
                            <div className="absolute top-1.5 left-1.5">
                              <div className={`w-4 h-4 rounded-sm border-2 ${item.isVeg ? "border-green-700 bg-green-500" : "border-red-700 bg-red-500"}`} />
                            </div>
                          </div>

                          {/* Name + desc + single-price ADD */}
                          <div className="flex-1 min-w-0 py-2.5 pr-3">
                            <div className="flex items-start gap-1 flex-wrap mb-0.5">
                              {item.isFeatured && (
                                <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "#fef3c7", color: "#b45309" }}>⭐ Popular</span>
                              )}
                              {item.isNew && (
                                <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: "#eff6ff", color: "#1d4ed8" }}>✨ New</span>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h3>
                            {item.description && (
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-1 mt-0.5">{item.description}</p>
                            )}

                            {/* Single-price item: price + ADD stepper */}
                            {!hasVariants && (
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-black text-sm" style={{ color: "#0d9488" }}>{formatINR(item.price)}</span>
                                {qty === 0 ? (
                                  <button
                                    onClick={() => addItem({ id: item.id, itemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, isVeg: item.isVeg })}
                                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
                                    style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}>
                                    + Add
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => updateQuantity(item.id, qty - 1)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm"
                                      style={{ background: "#0d9488" }}>−</button>
                                    <span className="font-black text-gray-900 w-5 text-center text-sm">{qty}</span>
                                    <button onClick={() => addItem({ id: item.id, itemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, isVeg: item.isVeg })}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm"
                                      style={{ background: "#0d9488" }}>+</button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Variant item: "from ₹X" price hint */}
                            {hasVariants && (
                              <p className="text-xs font-semibold mt-1" style={{ color: "#0d9488" }}>
                                From {formatINR(minPrice)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ── Inline variant rows (Half/Full or S/M/L) ── */}
                        {hasVariants && (
                          <div className="border-t border-gray-100 px-3 py-2 space-y-1.5">
                            {(item.variants ?? []).map((v: MenuVariant) => {
                              const vQty = getQty(item.id, v.label);
                              const cartId = `${item.id}::${v.label}`;
                              return (
                                <div key={v.label} className="flex items-center justify-between">
                                  {/* Label + price */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-600 w-14">{v.label}</span>
                                    <span className="font-black text-sm" style={{ color: "#0d9488" }}>{formatINR(v.price)}</span>
                                  </div>
                                  {/* Stepper */}
                                  {vQty === 0 ? (
                                    <button
                                      onClick={() => addItem({ id: cartId, itemId: item.id, name: item.name, price: v.price, imageUrl: item.imageUrl, isVeg: item.isVeg, variant: v.label })}
                                      className="px-4 py-1 rounded-lg text-xs font-bold text-white transition-transform active:scale-95"
                                      style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}>
                                      + Add
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <button onClick={() => updateQuantity(cartId, vQty - 1)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm"
                                        style={{ background: "#0d9488" }}>−</button>
                                      <span className="font-black text-gray-900 w-5 text-center text-sm">{vQty}</span>
                                      <button onClick={() => addItem({ id: cartId, itemId: item.id, name: item.name, price: v.price, imageUrl: item.imageUrl, isVeg: item.isVeg, variant: v.label })}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-sm"
                                        style={{ background: "#0d9488" }}>+</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-bold text-gray-700">No dishes found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
                {search && (
                  <button onClick={() => setSearch("")}
                    className="mt-4 px-6 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ background: "#0d9488" }}>
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FLOATING CART BAR (mobile only — desktop shows inline) ── */}
      {cartTotal > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-5">
          <Link
            href="/cart"
            className="flex items-center justify-between px-5 py-4 rounded-2xl text-white font-semibold transition-transform active:scale-95"
            style={{
              background: "linear-gradient(90deg, #0d9488, #0f766e)",
              boxShadow: "0 8px 32px rgba(13,148,136,0.5)",
            }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                style={{ background: "rgba(255,255,255,0.25)" }}>
                {cartTotal}
              </div>
              <div>
                <p className="font-bold text-sm leading-none">View Cart</p>
                <p className="text-teal-200 text-xs mt-0.5">{cartTotal} {cartTotal === 1 ? "item" : "items"}</p>
              </div>
            </div>
            <p className="font-black text-base leading-none">{formatINR(subtotal())}</p>
          </Link>
        </div>
      )}
    </div>
  );
}
