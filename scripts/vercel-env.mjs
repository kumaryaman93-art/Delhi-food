// Adds all required environment variables to Vercel via REST API
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Set your token: VERCEL_TOKEN=vcp_xxx node scripts/vercel-env.mjs
const TOKEN = process.env.VERCEL_TOKEN ?? "";

// ── Read .env.local ──────────────────────────────────────────────────────────
const envRaw = readFileSync(join(root, ".env.local"), "utf8");
function getEnv(key) {
  const match = envRaw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing env: ${key}`);
  // Strip surrounding quotes
  return match[1].replace(/^"|"$/g, "");
}

const PRIVATE_KEY = getEnv("FIREBASE_PRIVATE_KEY");

const ENV_VARS = [
  { key: "FIREBASE_PROJECT_ID",                      value: "delhi-food-9b366" },
  { key: "FIREBASE_CLIENT_EMAIL",                    value: "firebase-adminsdk-fbsvc@delhi-food-9b366.iam.gserviceaccount.com" },
  { key: "FIREBASE_PRIVATE_KEY",                     value: PRIVATE_KEY },
  { key: "NEXT_PUBLIC_FIREBASE_API_KEY",             value: "AIzaSyChmrZcPYKT99Zu8PgoXgZI0rEpxfKIF08" },
  { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",         value: "delhi-food-9b366.firebaseapp.com" },
  { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",          value: "delhi-food-9b366" },
  { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",      value: "delhi-food-9b366.firebasestorage.app" },
  { key: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", value: "39892035740" },
  { key: "NEXT_PUBLIC_FIREBASE_APP_ID",              value: "1:39892035740:web:3f6bd68174ad2e2df56559" },
  { key: "RAZORPAY_KEY_ID",                          value: "rzp_test_SfoPrdGT9NcMjd" },
  { key: "RAZORPAY_KEY_SECRET",                      value: "JaQBKZCbAW485PnKX2A3GW3R" },
  { key: "NEXT_PUBLIC_RAZORPAY_KEY_ID",              value: "rzp_test_SfoPrdGT9NcMjd" },
  { key: "NEXTAUTH_SECRET",                          value: "dfj-nextauth-secret-dev-key-2024-local" },
  { key: "NEXTAUTH_URL",                             value: "https://delhi-food.vercel.app" },
  { key: "ADMIN_JWT_SECRET",                         value: "dfj-admin-jwt-secret-production-2024" },
];

// ── Get project list ─────────────────────────────────────────────────────────
const projRes = await fetch("https://api.vercel.com/v9/projects", {
  headers: { Authorization: `Bearer ${TOKEN}` },
});
const { projects } = await projRes.json();

const project = projects?.find((p) => p.name.includes("delhi-food"));
if (!project) {
  console.error("❌ Could not find delhi-food project. Projects found:", projects?.map(p => p.name));
  process.exit(1);
}
console.log(`✅ Found project: ${project.name} (${project.id})`);

// ── Add each env var ──────────────────────────────────────────────────────────
let success = 0;
for (const { key, value } of ENV_VARS) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${project.id}/env`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        type: "encrypted",
        target: ["production", "preview", "development"],
      }),
    }
  );
  const data = await res.json();
  if (res.ok) {
    console.log(`  ✅ ${key}`);
    success++;
  } else if (data.error?.code === "ENV_ALREADY_EXISTS") {
    // Update existing
    const existing = data.error?.existingEnvVarIds?.[0];
    if (existing) {
      const upd = await fetch(
        `https://api.vercel.com/v10/projects/${project.id}/env/${existing}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value, target: ["production", "preview", "development"] }),
        }
      );
      if (upd.ok) {
        console.log(`  🔄 ${key} (updated)`);
        success++;
      } else {
        console.log(`  ❌ ${key} — update failed`);
      }
    }
  } else {
    console.log(`  ❌ ${key} — ${data.error?.message ?? JSON.stringify(data)}`);
  }
}

console.log(`\n✅ Done — ${success}/${ENV_VARS.length} variables set.`);
console.log("\n👉 Now trigger a redeploy from the Vercel dashboard.");
