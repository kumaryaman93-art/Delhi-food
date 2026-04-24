// Creates the composite Firestore index required by the live-orders query:
//   orders — where(status, in, [...]) + orderBy(createdAt, desc)
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createSign } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const envRaw = readFileSync(join(root, ".env.local"), "utf8");
function getEnv(key) {
  const match = envRaw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing env: ${key}`);
  return match[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

const PROJECT_ID   = getEnv("FIREBASE_PROJECT_ID");
const CLIENT_EMAIL = getEnv("FIREBASE_CLIENT_EMAIL");
const PRIVATE_KEY  = getEnv("FIREBASE_PRIVATE_KEY");

function base64url(obj) {
  const json = typeof obj === "string" ? obj : JSON.stringify(obj);
  return Buffer.from(json).toString("base64url");
}

function makeJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url({ alg: "RS256", typ: "JWT" });
  const payload = base64url({
    iss: CLIENT_EMAIL, sub: CLIENT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform",
  });
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${signer.sign(PRIVATE_KEY, "base64url")}`;
}

async function getToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: makeJWT() }).toString(),
  });
  const data = await res.json();
  if (!data.access_token) { console.error(data); process.exit(1); }
  return data.access_token;
}

const token = await getToken();

// Create composite index: status ASC + createdAt DESC on orders collection
const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/orders/indexes`;

const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    queryScope: "COLLECTION",
    fields: [
      { fieldPath: "status",    order: "ASCENDING"  },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  }),
});

const data = await res.json();

if (data.error) {
  if (data.error.status === "ALREADY_EXISTS") {
    console.log("✅ Index already exists — nothing to do.");
  } else {
    console.error("❌ Error:", data.error.message);
    process.exit(1);
  }
} else {
  console.log("✅ Index creation started:", data.name);
  console.log("   State:", data.state ?? "CREATING");
  console.log("   ⏳ Takes ~1-2 minutes to build. Refresh the admin dashboard after that.");
}
