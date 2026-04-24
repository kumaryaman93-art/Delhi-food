"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Sign in with Firebase Auth
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // Exchange for server session (checks admin claim)
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f2027, #1a3a2a)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🍽️</span>
          <h1 className="text-2xl font-bold text-white mt-3">Admin Panel</h1>
          <p className="text-teal-300 text-sm mt-1">Delhi Food Junction</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="p-6 rounded-2xl space-y-4"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          {error && (
            <div className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-teal-200 mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-gray-800 text-sm outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="admin@delhifoodjunction.com"
              style={{ background: "rgba(255,255,255,0.95)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-teal-200 mb-1">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 rounded-xl text-gray-800 text-sm outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="••••••••"
              style={{ background: "rgba(255,255,255,0.95)" }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-70"
            style={{ background: "#0d9488" }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
