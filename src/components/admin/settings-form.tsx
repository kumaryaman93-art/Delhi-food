"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

interface Settings {
  restaurantName: string;
  tagline: string;
  about: string;
  phone: string;
  address: string;
  gstRate: number;
  packagingFee: number;
  defaultEta: number;
  dineInEnabled: boolean;
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  codEnabled: boolean;
  soundEnabled: boolean;
}

export default function AdminSettingsClient({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleChange(key: keyof Settings, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  const Toggle = ({ field, label }: { field: keyof Settings; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => handleChange(field, !form[field])}
        className={`w-11 h-6 rounded-full transition-colors ${form[field] ? "bg-teal-500" : "bg-gray-200"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${form[field] ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  const Field = ({ label, field, type = "text" }: { label: string; field: keyof Settings; type?: string }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => handleChange(field, type === "number" ? parseFloat(e.target.value) : e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400"
      />
    </div>
  );

  return (
    <div className="space-y-4 fade-in max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-70"
          style={{ background: saved ? "#16a34a" : "#0d9488" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-700">Restaurant Info</h2>
        <Field label="Restaurant Name" field="restaurantName" />
        <Field label="Tagline" field="tagline" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">About</label>
          <textarea
            value={form.about}
            onChange={(e) => handleChange("about", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-teal-400 resize-none"
          />
        </div>
        <Field label="Phone" field="phone" />
        <Field label="Address" field="address" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="font-bold text-gray-700">Pricing</h2>
        <Field label="GST Rate (%)" field="gstRate" type="number" />
        <Field label="Packaging Fee (₹)" field="packagingFee" type="number" />
        <Field label="Default ETA (minutes)" field="defaultEta" type="number" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-700 mb-2">Order Options</h2>
        <Toggle field="dineInEnabled" label="Dine-In" />
        <Toggle field="takeawayEnabled" label="Takeaway" />
        <Toggle field="deliveryEnabled" label="Delivery" />
        <Toggle field="codEnabled" label="Cash on Delivery" />
        <Toggle field="soundEnabled" label="Admin Sound Alerts" />
      </div>
    </div>
  );
}
