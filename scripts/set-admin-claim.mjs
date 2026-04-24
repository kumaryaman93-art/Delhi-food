// Sets the { admin: true } Firebase custom claim on the admin UID.
// Run once: node scripts/set-admin-claim.mjs
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Load .env.local ──────────────────────────────────────────────────────────
const envRaw = readFileSync(join(root, ".env.local"), "utf8");
function getEnv(key) {
  const match = envRaw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing env: ${key}`);
  return match[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

const ADMIN_UID = "wmYydBiDaSVj7tRUFcdiVCkPgwr2";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: getEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getEnv("FIREBASE_PRIVATE_KEY"),
    }),
  });
}

try {
  await admin.auth().setCustomUserClaims(ADMIN_UID, { admin: true });
  const user = await admin.auth().getUser(ADMIN_UID);
  console.log("✅ Admin claim set successfully!");
  console.log("   UID   :", user.uid);
  console.log("   Email :", user.email);
  console.log("   Claims:", user.customClaims);
} catch (err) {
  console.error("❌ Failed:", err.message);
  process.exit(1);
}
