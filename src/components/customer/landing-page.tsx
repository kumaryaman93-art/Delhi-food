"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithRedirect,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Pizza Mascot (original design) ──────────────────────────────────────────
function PizzaMascot() {
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
      if (pupil) {
        pupil.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", movePupils);
    // Random blink every 3–5 seconds
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => {
      window.removeEventListener("mousemove", movePupils);
      clearInterval(blinkInterval);
    };
  }, [movePupils]);

  return (
    <div className="relative select-none" style={{ width: 140, height: 140 }}>
      {/* Pizza base */}
      <svg width="140" height="140" viewBox="0 0 140 140" className="absolute inset-0">
        {/* Crust */}
        <circle cx="70" cy="70" r="68" fill="#d97706" />
        <circle cx="70" cy="70" r="60" fill="#fbbf24" />
        {/* Sauce */}
        <circle cx="70" cy="70" r="52" fill="#dc2626" />
        {/* Cheese */}
        <ellipse cx="70" cy="70" rx="44" ry="42" fill="#fef3c7" />
        {/* Toppings - olives */}
        <circle cx="50" cy="52" r="5" fill="#1a1a1a" opacity="0.7" />
        <circle cx="95" cy="58" r="4" fill="#1a1a1a" opacity="0.7" />
        <circle cx="58" cy="92" r="4" fill="#1a1a1a" opacity="0.7" />
        <circle cx="90" cy="88" r="5" fill="#1a1a1a" opacity="0.7" />
        {/* Toppings - peppers */}
        <ellipse cx="78" cy="48" rx="5" ry="3" fill="#16a34a" opacity="0.8" transform="rotate(-20 78 48)" />
        <ellipse cx="46" cy="76" rx="5" ry="3" fill="#16a34a" opacity="0.8" transform="rotate(40 46 76)" />
        <ellipse cx="96" cy="74" rx="5" ry="3" fill="#16a34a" opacity="0.8" transform="rotate(-30 96 74)" />
      </svg>

      {/* Left eye */}
      <div
        ref={leftEyeRef}
        className="absolute rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          width: 26, height: blinking ? 4 : 26,
          left: 32, top: 52,
          transition: "height 0.08s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="pupil rounded-full bg-gray-900 transition-transform duration-75"
          style={{ width: 12, height: 12, flexShrink: 0 }}
        />
      </div>

      {/* Right eye */}
      <div
        ref={rightEyeRef}
        className="absolute rounded-full bg-white flex items-center justify-center overflow-hidden"
        style={{
          width: 26, height: blinking ? 4 : 26,
          left: 82, top: 52,
          transition: "height 0.08s ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="pupil rounded-full bg-gray-900 transition-transform duration-75"
          style={{ width: 12, height: 12, flexShrink: 0 }}
        />
      </div>

      {/* Smile */}
      <svg
        width="50" height="20"
        viewBox="0 0 50 20"
        className="absolute"
        style={{ left: 45, top: 88 }}
      >
        <path d="M5 5 Q25 20 45 5" stroke="#92400e" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      {/* Rosy cheeks */}
      <div className="absolute rounded-full opacity-40" style={{ width: 14, height: 10, left: 24, top: 80, background: "#f87171" }} />
      <div className="absolute rounded-full opacity-40" style={{ width: 14, height: 10, left: 102, top: 80, background: "#f87171" }} />
    </div>
  );
}

// ─── Floating food particles ──────────────────────────────────────────────────
const FOODS = ["🍕", "🍜", "🥗", "🍛", "🧆", "🥟", "🍱", "🌮", "🥘", "🍲"];

function FloatingFoods() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {FOODS.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-3xl"
          style={{
            top: `${8 + i * 9}%`,
            left: `${3 + (i % 5) * 20}%`,
            opacity: 0.12,
            animation: `floatFood ${5 + i * 0.7}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
type View = "main" | "login" | "register";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Safe same-origin returnTo (guards against open redirect)
  const rawReturnTo = searchParams.get("returnTo") ?? "";
  const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/home";

  // Cursor parallax for background blobs
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  // onAuthStateChanged can fire with null FIRST while Firebase is still
  // processing the redirect result. We must NOT unsubscribe on null —
  // keep listening until Firebase finishes and fires with the actual user.
  useEffect(() => {
    let done = false;
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (done) return;

      if (firebaseUser) {
        // Got a user (from Google redirect OR existing session)
        done = true;
        unsubscribe();
        try {
          await createServerSession(firebaseUser);
          // Full page navigation — more reliable than router.push after OAuth redirect
          window.location.href = returnTo;
        } catch (err) {
          console.error("Session creation failed:", err);
          setError("Sign-in failed. Please try again.");
          setLoading(false);
          done = false; // allow retry
        }
      } else {
        // null — Firebase may still be processing redirect, keep listening.
        // Only hide the spinner so the form is usable for email login.
        setLoading(false);
      }
    });

    return () => { done = true; unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createServerSession(user: import("firebase/auth").User) {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session creation failed");
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      // signInWithRedirect is more reliable than signInWithPopup:
      // no popup blockers, works on all browsers and mobile.
      // The result is handled in the useEffect above when the page reloads.
      await signInWithRedirect(auth, provider);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
    // Note: setLoading(false) is NOT called here — page will redirect to Google
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createServerSession(result.user);
      router.push(returnTo);
      router.refresh();
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(result.user, { displayName: name });
      await createServerSession(result.user);
      router.push(returnTo);
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") setError("Email already registered. Try logging in.");
      else if (code === "auth/weak-password") setError("Password must be at least 6 characters.");
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const blobX = cursor.x * 0.02;
  const blobY = cursor.y * 0.02;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(135deg, #0f2027 0%, #1a3a2a 40%, #0d4a3a 70%, #0a2a20 100%)" }}
      />

      {/* Cursor-reactive blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500, top: -100, right: -100,
            background: "radial-gradient(circle, rgba(13,148,136,0.18), transparent 70%)",
            transform: `translate(${-blobX}px, ${blobY}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400, bottom: -80, left: -80,
            background: "radial-gradient(circle, rgba(217,119,6,0.15), transparent 70%)",
            transform: `translate(${blobX}px, ${-blobY}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            top: "40%", left: "60%",
            background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)",
            transform: `translate(${blobX * 1.5}px, ${blobY * 1.5}px)`,
            transition: "transform 0.2s ease-out",
          }}
        />
      </div>

      <FloatingFoods />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-sm">

        {/* Pizza mascot + branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3" style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}>
            <PizzaMascot />
          </div>
          <h1
            className="text-3xl font-bold text-white text-center leading-tight"
            style={{ fontFamily: "'Georgia', serif", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            Delhi Food Junction
          </h1>
          <p className="text-teal-300 text-sm font-medium mt-1 tracking-widest uppercase">
            100% Pure Vegetarian
          </p>
          <div className="flex gap-2 flex-wrap justify-center mt-3">
            {["🌿 Pure Veg", "⭐ 4.2 Rated", "📍 Ludhiana"].map((b) => (
              <span
                key={b}
                className="px-2.5 py-1 rounded-full text-xs font-medium text-teal-100"
                style={{ background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.35)" }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div
          className="w-full rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}
        >
          {view === "main" && (
            <div className="space-y-3">
              <h2 className="text-white text-lg font-semibold text-center mb-4">
                Welcome! How would you like to continue?
              </h2>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              </div>

              <button
                onClick={() => setView("login")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white active:scale-95 transition-all"
                style={{ background: "rgba(13,148,136,0.8)" }}
              >
                ✉️ Login with Email
              </button>
              <button
                onClick={() => setView("register")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold active:scale-95 transition-all hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                👤 Create New Account
              </button>

              <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                We only access your name and email. No spam, ever.
              </p>
            </div>
          )}

          {view === "login" && (
            <>
              <button onClick={() => { setView("main"); setError(""); }} className="text-teal-400 text-sm mb-4 flex items-center gap-1">← Back</button>
              <h2 className="text-white font-bold text-lg mb-4">Login</h2>
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email" placeholder="Email address" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400"
                  style={{ background: "rgba(255,255,255,0.92)", color: "#1f2937" }}
                />
                <input
                  type="password" placeholder="Password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400"
                  style={{ background: "rgba(255,255,255,0.92)", color: "#1f2937" }}
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
              <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                No account?{" "}
                <button onClick={() => { setView("register"); setError(""); }} className="text-teal-400 underline">Register</button>
              </p>
            </>
          )}

          {view === "register" && (
            <>
              <button onClick={() => { setView("main"); setError(""); }} className="text-teal-400 text-sm mb-4 flex items-center gap-1">← Back</button>
              <h2 className="text-white font-bold text-lg mb-4">Create Account</h2>
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text" placeholder="Your name" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400"
                  style={{ background: "rgba(255,255,255,0.92)", color: "#1f2937" }}
                />
                <input
                  type="email" placeholder="Email address" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400"
                  style={{ background: "rgba(255,255,255,0.92)", color: "#1f2937" }}
                />
                <input
                  type="password" placeholder="Password (min 6 chars)" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400"
                  style={{ background: "rgba(255,255,255,0.92)", color: "#1f2937" }}
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-60 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(90deg, #0d9488, #0f766e)" }}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
              <p className="text-center text-xs mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                Already have an account?{" "}
                <button onClick={() => { setView("login"); setError(""); }} className="text-teal-400 underline">Login</button>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center gap-4 flex-wrap justify-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span>📍 Netaji Nagar, Salem Tabri, Ludhiana</span>
          <span>📞 099147 55509</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatFood {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
