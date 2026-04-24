/**
 * One-time script: creates the admin Firebase account and sets ADMIN_EMAILS.
 * Run: node scripts/create-admin-user.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Load env vars from .env.local ─────────────────────────────────────────────
const raw = readFileSync(join(root, ".env.local"), "utf8");
function env(key) {
  const m = raw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!m) throw new Error(`Missing ${key} in .env.local`);
  return m[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   env("FIREBASE_PROJECT_ID"),
      clientEmail: env("FIREBASE_CLIENT_EMAIL"),
      privateKey:  env("FIREBASE_PRIVATE_KEY"),
    }),
  });
}

const auth = getAuth();

const ADMIN_EMAIL    = "admin@delhifood.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME     = "Admin";

console.log(`\n🔧 Setting up admin account: ${ADMIN_EMAIL}\n`);

try {
  // Try to get existing user first
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log("ℹ️  User already exists — updating password...");
    user = await auth.updateUser(user.uid, {
      password:    ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
    });
    console.log("✅ Password updated.");
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      console.log("➕ Creating new user...");
      user = await auth.createUser({
        email:        ADMIN_EMAIL,
        password:     ADMIN_PASSWORD,
        displayName:  ADMIN_NAME,
        emailVerified: true,
      });
      console.log("✅ User created:", user.uid);
    } else {
      throw e;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   UID      : ${user.uid}`);
  console.log(`\n👉 Next: add  ADMIN_EMAILS=${ADMIN_EMAIL}  to Vercel env vars.`);
  console.log(`   Admin login URL: https://delhi-food.vercel.app/admin/login\n`);

} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
