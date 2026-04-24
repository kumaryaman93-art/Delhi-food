// Deploy Firestore security rules via REST API using service-account credentials
// No firebase-tools login required.
import { readFileSync } from "fs";
import { createSign } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── Load .env.local ──────────────────────────────────────────────────────────
const envRaw = readFileSync(join(root, ".env.local"), "utf8");
function getEnv(key) {
  const match = envRaw.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) throw new Error(`Missing env: ${key}`);
  return match[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

const PROJECT_ID   = getEnv("FIREBASE_PROJECT_ID");
const CLIENT_EMAIL = getEnv("FIREBASE_CLIENT_EMAIL");
const PRIVATE_KEY  = getEnv("FIREBASE_PRIVATE_KEY");

// ── Read rules file ───────────────────────────────────────────────────────────
const rulesSource = readFileSync(join(root, "firestore.rules"), "utf8");

// ── Build a service-account JWT (RFC 7519) ────────────────────────────────────
function base64url(obj) {
  const json = typeof obj === "string" ? obj : JSON.stringify(obj);
  return Buffer.from(json).toString("base64url");
}

function makeJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url({ alg: "RS256", typ: "JWT" });
  const payload = base64url({
    iss: CLIENT_EMAIL,
    sub: CLIENT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform",
  });
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  const sig = signer.sign(PRIVATE_KEY, "base64url");
  return `${header}.${payload}.${sig}`;
}

// ── Exchange JWT for access token ─────────────────────────────────────────────
async function getAccessToken() {
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: makeJWT(),
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error("Token error:", data);
    process.exit(1);
  }
  return data.access_token;
}

// ── Deploy via Firebase Security Rules API ────────────────────────────────────
async function deployRules(token) {
  // 1. Create a new ruleset
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          files: [{ name: "firestore.rules", content: rulesSource }],
        },
      }),
    }
  );
  const ruleset = await createRes.json();
  if (!ruleset.name) {
    console.error("Ruleset create error:", ruleset);
    process.exit(1);
  }
  console.log("✅ Ruleset created:", ruleset.name);

  // 2. Get the current release name
  const releaseId = `projects/${PROJECT_ID}/releases/cloud.firestore`;

  // 3. Update the release to point to the new ruleset
  const patchRes = await fetch(
    `https://firebaserules.googleapis.com/v1/${releaseId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        release: { name: releaseId, rulesetName: ruleset.name },
      }),
    }
  );
  const release = await patchRes.json();
  if (release.error) {
    console.error("Release update error:", release.error);
    process.exit(1);
  }
  console.log("✅ Release updated → Firestore rules deployed!");
  console.log("   Ruleset:", ruleset.name);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const token = await getAccessToken();
await deployRules(token);
