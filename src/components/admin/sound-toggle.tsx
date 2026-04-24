"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const STORAGE_KEY = "dfj-admin-sound";

// Generates a pleasant 2-tone chime using Web Audio API (no MP3 file needed)
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;

    const tones = [
      { freq: 880, start: 0, dur: 0.3 },
      { freq: 1109, start: 0.18, dur: 0.4 },
    ];

    tones.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });
  } catch {
    // Silently fail if AudioContext not available
  }
}

interface Props {
  newOrderSignal: number; // increment this each time a new order arrives
}

export default function SoundToggle({ newOrderSignal }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const prevSignalRef = useRef(0);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setEnabled(true);
    } else if (stored === null) {
      // First visit — show banner
      setShowBanner(true);
    }
  }, []);

  // Play chime when new order arrives and sound is enabled
  useEffect(() => {
    if (newOrderSignal > 0 && newOrderSignal !== prevSignalRef.current && enabled) {
      playChime();
    }
    prevSignalRef.current = newOrderSignal;
  }, [newOrderSignal, enabled]);

  function enable() {
    setEnabled(true);
    setShowBanner(false);
    localStorage.setItem(STORAGE_KEY, "true");
    playChime(); // play once as confirmation
  }

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    if (next) playChime();
  }

  return (
    <>
      {/* First-visit banner */}
      {showBanner && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ background: "#fef3c7", borderColor: "#fcd34d" }}>
          <span className="text-xl">🔔</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Enable sound alerts for new orders?</p>
            <p className="text-xs text-amber-700 mt-0.5">You&apos;ll hear a chime whenever a new order arrives.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={enable}
              className="px-3 py-1.5 rounded-lg text-sm font-bold text-white"
              style={{ background: "#d97706" }}>
              Enable
            </button>
            <button
              onClick={() => { setShowBanner(false); localStorage.setItem(STORAGE_KEY, "false"); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-700 bg-amber-100">
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Persistent toggle (top-right area) */}
      <button
        onClick={toggle}
        title={enabled ? "Sound alerts ON — click to mute" : "Sound alerts OFF — click to enable"}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
        style={enabled
          ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
          : { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}>
        {enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        {enabled ? "Sound ON" : "Sound OFF"}
      </button>
    </>
  );
}

export { playChime };
