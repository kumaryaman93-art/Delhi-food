import Link from "next/link";
import Image from "next/image";
import { getMenuCategories } from "@/lib/firestore/menu";
import { UtensilsCrossed, Star, Clock, Users, Phone, MapPin, ChevronRight } from "lucide-react";
import HomeHero from "@/components/customer/home-hero";

// Curated hero images per category for rich visual grid
const CATEGORY_BG: Record<string, string> = {
  "Chat & Snacks":        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80",
  "Chinese Snacks":       "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80",
  "Pizza":                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  "Pasta":                "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80",
  "Soups":                "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "Noodles":              "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
  "Fried Rice & Combo":   "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80",
  "South Indian":         "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80",
  "Biryani & Rice":       "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
  "Indian Main Course":   "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  "Indian Breads":        "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80",
  "Tandoori Snacks":      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80",
  "Wraps (Kathi Roll)":   "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80",
  "Burger":               "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  "Sandwich & Garlic Bread": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80",
  "Momos":                "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600&q=80",
  "Raita & Salad":        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "Mocktail":             "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",
  "Hot Coffee & Beverages":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  "Ice Cream & Shakes":   "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
};

const FALLBACK_BG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

export default async function HomePage() {
  const categories = await getMenuCategories();

  const stats = [
    { icon: <Star className="w-5 h-5" />, value: "4.2★", label: "Rating" },
    { icon: <Users className="w-5 h-5" />, value: "756+", label: "Reviews" },
    { icon: <UtensilsCrossed className="w-5 h-5" />, value: "185+", label: "Dishes" },
    { icon: <Clock className="w-5 h-5" />, value: "2015", label: "Est." },
  ];

  return (
    <div className="fade-in pb-8">

      {/* ── HERO ── */}
      <HomeHero />

      {/* ── STATS ── */}
      <section className="px-4 mt-6 relative z-10">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label}
              className="flex flex-col items-center py-4 px-2 rounded-2xl"
              style={{
                background: "white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}>
              <div style={{ color: "#0d9488" }}>{s.icon}</div>
              <span className="text-base font-black mt-1" style={{ color: "#0f172a" }}>{s.value}</span>
              <span className="text-xs text-gray-500 mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED BANNER ── */}
      <section className="px-4 mt-6">
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)", minHeight: "130px" }}>
          <div className="absolute right-0 bottom-0 text-8xl leading-none select-none" style={{ opacity: 0.25 }}>🍕</div>
          <div className="relative z-10 p-5">
            <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">Today&apos;s Special</span>
            <h3 className="text-xl font-black text-white mt-1 mb-1">Fresh & Hot Meals</h3>
            <p className="text-amber-100 text-sm mb-4">Order now, ready in 15 mins</p>
            <Link href="/menu"
              className="inline-flex items-center gap-1 px-5 py-2 rounded-full text-sm font-bold"
              style={{ background: "white", color: "#b45309" }}>
              Order Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES GRID ── */}
      {categories.length > 0 && (
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">What&apos;s on the Menu?</h2>
            <Link href="/menu" className="text-sm font-semibold" style={{ color: "#0d9488" }}>
              See all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat, i) => {
              const imgUrl = CATEGORY_BG[cat.name] ?? FALLBACK_BG;
              // First 2 categories get a larger card (span both columns on first row)
              const isHero = i === 0;
              return (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.id}`}
                  className={`relative rounded-2xl overflow-hidden transition-transform active:scale-95 ${isHero ? "col-span-2" : ""}`}
                  style={{ height: isHero ? "160px" : "110px" }}
                >
                  {/* Food photo background */}
                  <Image
                    src={imgUrl}
                    alt={cat.name}
                    fill
                    unoptimized
                    className="object-cover"
                    loading={i < 4 ? "eager" : "lazy"}
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)"
                  }} />
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end gap-2">
                    <span className="text-2xl leading-none">{cat.emoji ?? "🍽️"}</span>
                    <span className="text-white font-bold text-sm leading-tight">{cat.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── WHY US ── */}
      <section className="px-4 mt-6">
        <div className="rounded-3xl p-5"
          style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", border: "1px solid #d1fae5" }}>
          <h2 className="text-lg font-black text-gray-900 mb-4">Why Delhi Food Junction?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "🌿", title: "100% Veg", desc: "No meat, no eggs — purely vegetarian" },
              { emoji: "👨‍🍳", title: "Fresh Daily", desc: "Cooked fresh in our own kitchen" },
              { emoji: "🎉", title: "Party Hall", desc: "Private dining for 15–20 guests" },
              { emoji: "⚡", title: "Fast Service", desc: "Your food, hot and quick" },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(13,148,136,0.1)" }}>
                  {f.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="px-4 mt-6">
        <div className="rounded-3xl overflow-hidden" style={{ background: "#0d2b1f" }}>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-base">🍽️</div>
              <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Our Story</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Since 2015, Delhi Food Junction has been Salem Tabri&apos;s go-to pure veg destination.
              From sizzling <span className="text-teal-300 font-medium">Chinese snacks</span> to
              comforting <span className="text-teal-300 font-medium">South Indian</span> and
              aromatic <span className="text-teal-300 font-medium">North Indian mains</span> —
              every dish is made with fresh ingredients and a whole lot of love.
            </p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="text-gray-400 text-xs">Salem Tabri, Ludhiana, Punjab</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <a href="tel:+918557877711" className="text-gray-400 text-xs">+91 85578 77711 / +91 70877 12202</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 mt-6">
        <Link href="/menu"
          className="flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white text-lg transition-transform active:scale-95"
          style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)", boxShadow: "0 4px 20px rgba(13,148,136,0.35)" }}>
          <UtensilsCrossed className="w-5 h-5" />
          View Full Menu
        </Link>
      </section>
    </div>
  );
}
