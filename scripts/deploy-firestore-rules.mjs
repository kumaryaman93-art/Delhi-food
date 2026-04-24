/**
 * Deploys firestore.rules to Firebase using the service account (no firebase login needed).
 * Run: node scripts/deploy-firestore-rules.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Load env ──────────────────────────────────────────────────────────────────
const raw = readFileSync(join(root, ".env.local"), "utf8");
function env(key) {
  const m = raw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!m) throw new Error(`Missing ${key} in .env.local`);
  return m[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

const PROJECT_ID   = env("FIREBASE_PROJECT_ID");
const CLIENT_EMAIL = env("FIREBASE_CLIENT_EMAIL");
const PRIVATE_KEY  = env("FIREBASE_PRIVATE_KEY");

// ── Get OAuth2 access token from service account ──────────────────────────────
async function getAccessToken() {
  const { createSign } = await import("crypto");

  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(PRIVATE_KEY, "base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get token: " + JSON.stringify(data));
  return data.access_token;
}

// ── Read rules file ───────────────────────────────────────────────────────────
const rulesContent = readFileSync(join(root, "firestore.rules"), "utf8");
console.log("📋 Rules file loaded.\n");

// ── Deploy ────────────────────────────────────────────────────────────────────
console.log("🔑 Getting access token...");
const token = await getAccessToken();
console.log("✅ Got token.\n");

// 1. Create a new ruleset
console.log("📤 Creating new ruleset...");
const createRes = await fetch(
  `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      source: {
        files: [{ name: "firestore.rules", content: rulesContent }],
      },
    }),
  }
);
const createData = await createRes.json();
if (!createRes.ok) {
  console.error("❌ Failed to create ruleset:", JSON.stringify(createData, null, 2));
  process.exit(1);
}
const rulesetName = createData.name;
console.log("✅ Ruleset created:", rulesetName, "\n");

// 2. Update the Firestore release to use the new ruleset
console.log("🔗 Updating Firestore release...");
const releaseRes = await fetch(
  `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`,
  {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      release: { name: `projects/${PROJECT_ID}/releases/cloud.firestore`, rulesetName },
      updateMask: "rulesetName",
    }),
  }
);
const releaseData = await releaseRes.json();
if (!releaseRes.ok) {
  console.error("❌ Failed to update release:", JSON.stringify(releaseData, null, 2));
  process.exit(1);
}

console.log("✅ Firestore rules deployed successfully!");
console.log("   Ruleset:", rulesetName);
console.log("\n🎉 admin@delhifood.com can now read all orders in the dashboard.\n");
