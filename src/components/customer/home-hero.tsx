"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Phone, MapPin, Star } from "lucide-react";

// ─── Animated Pizza Mascot (from landing page) ─────────────────────────────
function PizzaMascot({ size = 160 }: { size?: number }) {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);

  const movePupils = useCallback((e: MouseEvent) => {
    [leftEyeRef, rightEyeRef].forEach((eyeRef) => {
      const eye = eyeRef.current;
      if (!eye) return;
      const rect = eye.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = 5;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const pupil = eye.querySelector(".pupil") as HTMLElement;
      if (pupil) pupil.style.transform = `translate(${x}px, ${y}px)`;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", movePupils);
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => {
      window.removeEventListener("mousemove", movePupils);
      clearInterval(blinkInterval);
    };
  }, [movePupils]);

  const scale = size / 140;

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140" className="absolute inset-0">
        <circle cx="70" cy="70" r="68" fill="#d97706" />
        <circle cx="70" cy="70" r="60" fill="#fbbf24" />
        <circle cx="70" cy="70" r="52" fill="#dc2626" />
        <ellipse cx="70" cy="70" rx="44" ry="42" fill="#fef3c7" />
        <circle cx="50" cy="52" r="5" fill="#1a1a1a" opacity="0.7" />
        <circle cx="95" cy="58" r="4" fill="#1a1a1a" opacity="0.7" />
        <circle cx="58" cy="92" r="4" fill="#1a1a1a" opacity="0.7" />
        <circle cx="90" cy="88" r="5" fill="#1a1a1a" opacity="0.7" />
        <ellipse cx="78" cy="48" rx="5" ry="3" fill="#16a34a" opacity="0.8" transform="rotate(-20 78 48)" />
        <ellipse cx="46" cy="76" rx="5" ry="3" fill="#16a34a" opacity="0.8" transform="rotate(40 46 76)" />
        <ellipse cx="96" cy="74" rx="5" ry="3" fill="#16a34a" opacity="0.8" transform="rotate(-30 96 74)" />
      </svg>

      {/* Left eye */}
      <div
        ref={leftEyeRef}
        className="absolute rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          width: 26 * scale, height: blinking ? 4 : 26 * scale,
          left: 32 * scale, top: 52 * scale,
          transition: "height 0.08s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <div className="pupil rounded-full bg-gray-900 transition-transform duration-75"
          style={{ width: 12 * scale, height: 12 * scale, flexShrink: 0 }} />
      </div>

      {/* Right eye */}
      <div
        ref={rightEyeRef}
        className="absolute rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          width: 26 * scale, height: blinking ? 4 : 26 * scale,
          left: 82 * scale, top: 52 * scale,
          transition: "height 0.08s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <div className="pupil rounded-full bg-gray-900 transition-transform duration-75"
          style={{ width: 12 * scale, height: 12 * scale, flexShrink: 0 }} />
      </div>

      {/* Smile */}
      <svg width={50 * scale} height={20 * scale} viewBox="0 0 50 20"
        className="absolute" style={{ left: 45 * scale, top: 88 * scale }}>
        <path d="M5 5 Q25 20 45 5" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* Cheeks */}
      <div className="absolute rounded-full opacity-40"
        style={{ width: 14 * scale, height: 10 * scale, left: 24 * scale, top: 80 * scale, background: "#f87171" }} />
      <div className="absolute rounded-full opacity-40"
        style={{ width: 14 * scale, height: 10 * scale, left: 102 * scale, top: 80 * scale, background: "#f87171" }} />
    </div>
  );
}

// ─── Floating food particles ────────────────────────────────────────────────
const FOODS = ["🍕", "🍜", "🥗", "🍛", "🧆", "🥟", "🍱", "🫔", "🥘", "🍲"];

function FloatingFoods() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {FOODS.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-2xl md:text-3xl"
          style={{
            top: `${5 + i * 9.5}%`,
            left: `${2 + (i % 5) * 21}%`,
            opacity: 0.1,
            animation: `floatFood ${5 + i * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Scrolling marquee of dishes ────────────────────────────────────────────
const DISHES = ["Pav Bhaji", "Paneer Tikka", "Masala Dosa", "Veg Biryani", "Hakka Noodles", "Dal Makhani", "Margherita Pizza", "Malai Kofta", "Tandoori Momos", "Cheese Burst Burger"];

function DishMarquee() {
  return (
    <div className="overflow-hidden w-full py-2" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <div className="flex gap-4 w-max" style={{ animation: "marquee 22s linear infinite" }}>
        {[...DISHES, ...DISHES].map((d, i) => (
          <span key={i} className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap"
            style={{ background: "rgba(13,148,136,0.18)", color: "#5eead4", border: "1px solid rgba(13,148,136,0.3)" }}>
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main Hero ──────────────────────────────────────────────────────────────
export default function HomeHero() {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handle = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  const blobX = cursor.x * 0.015;
  const blobY = cursor.y * 0.015;

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "100svh" }}>

      {/* Background */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0f2027 0%, #1a3a2a 40%, #0d4a3a 70%, #0a2a20 100%)" }} />

      {/* Cursor-reactive blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full"
          style={{
            width: 600, height: 600, top: -150, right: -150,
            background: "radial-gradient(circle, rgba(13,148,136,0.2), transparent 70%)",
            transform: `translate(${-blobX}px, ${blobY}px)`,
            transition: "transform 0.4s ease-out",
          }} />
        <div className="absolute rounded-full"
          style={{
            width: 400, height: 400, bottom: -100, left: -100,
            background: "radial-gradient(circle, rgba(217,119,6,0.18), transparent 70%)",
            transform: `translate(${blobX}px, ${-blobY}px)`,
            transition: "transform 0.3s ease-out",
          }} />
        <div className="absolute rounded-full"
          style={{
            width: 300, height: 300, top: "45%", left: "55%",
            background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
            transform: `translate(${blobX * 1.5}px, ${blobY * 1.5}px)`,
            transition: "transform 0.25s ease-out",
          }} />
      </div>

      <FloatingFoods />

      {/* Content — mobile: mascot first, desktop: balanced two column */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen px-6 pt-24 pb-16 md:py-16 max-w-5xl mx-auto gap-7 md:gap-10">

        {/* Mascot — top on mobile, right side on desktop */}
        <div className={`order-1 md:order-2 flex flex-col items-center gap-3 flex-shrink-0 transition-all duration-700 delay-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <div
            className="rounded-full"
            style={{
              filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.6))",
              animation: "bobble 4s ease-in-out infinite",
            }}
          >
            <PizzaMascot size={150} />
          </div>

          {/* Stats row under mascot */}
          <div className="hidden sm:grid grid-cols-3 gap-2 mt-1">
            {[
              { val: "185+", label: "Dishes" },
              { val: "756+", label: "Reviews" },
              { val: "2015", label: "Est." },
            ].map((s) => (
              <div key={s.label}
                className="flex flex-col items-center py-2 px-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-base font-black text-white">{s.val}</span>
                <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left — copy */}
        <div className={`order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left flex-1 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

          {/* Pure veg badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 md:mb-5"
            style={{ background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.45)", color: "#5eead4" }}>
            🌿 100% Pure Vegetarian
          </div>

          <h1 className="text-4xl min-[380px]:text-5xl md:text-6xl font-black text-white leading-tight mb-3"
            style={{ fontFamily: "'Georgia', serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            Delhi Food<br />
            <span style={{ color: "#fbbf24" }}>Junction</span>
          </h1>

          <p className="text-teal-300 text-lg font-medium mb-1 tracking-wide">
            Ludhiana&apos;s Favourite Veg Kitchen
          </p>
          <p className="text-gray-400 text-sm mb-5 md:mb-6 max-w-sm leading-relaxed">
            From sizzling Chinese snacks to hearty North Indian mains — crafted fresh every day, served with love since 2015.
          </p>

          {/* Rating badges */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6 md:mb-8">
            {[
              { icon: <Star className="w-3 h-3" fill="currentColor" />, text: "4.2 Rated", color: "#fbbf24" },
              { icon: "🌿", text: "Pure Veg", color: "#34d399" },
              { icon: "📍", text: "Ludhiana", color: "#60a5fa" },
              { icon: "🎉", text: "Party Hall", color: "#f472b6" },
            ].map((b, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: b.color }}>
                {typeof b.icon === "string" ? b.icon : b.icon}
                {b.text}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 flex-wrap justify-center md:justify-start mb-6 md:mb-8">
            <Link href="/menu"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-base transition-transform active:scale-95 hover:opacity-90"
              style={{ background: "linear-gradient(90deg, #0d9488, #d97706)", boxShadow: "0 4px 24px rgba(13,148,136,0.45)" }}>
              Explore Menu <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="tel:+919914755509"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm transition-all active:scale-95 hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>
              <Phone className="w-4 h-4" /> Call to Order
            </a>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <MapPin className="w-3 h-3" />
            <span>Netaji Nagar, Salem Tabri, Ludhiana · 099147 55509</span>
          </div>
        </div>
      </div>

      {/* Dish marquee at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-4">
        <DishMarquee />
      </div>

      <style jsx global>{`
        @keyframes floatFood {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
        @keyframes bobble {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
