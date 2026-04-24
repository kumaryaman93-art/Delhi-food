import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const envRaw = readFileSync(join(root, ".env.local"), "utf8");
function getEnv(key) {
  const match = envRaw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing env: ${key}`);
  return match[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: getEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getEnv("FIREBASE_PRIVATE_KEY"),
    }),
  });
}

const user = await admin.auth().getUser("wmYydBiDaSVj7tRUFcdiVCkPgwr2");
console.log("Email:", user.email);
console.log("Providers:", user.providerData.map(p => p.providerId));
console.log("Claims:", user.customClaims);
