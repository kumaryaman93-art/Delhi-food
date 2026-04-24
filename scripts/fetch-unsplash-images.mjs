/**
 * fetch-unsplash-images.mjs
 *
 * Queries the Unsplash API for each menu item, picks the best-matching photo,
 * and updates the Firestore menuItems collection with the real URL.
 *
 * Requires: UNSPLASH_ACCESS_KEY in .env.local (or env).
 *
 * Behavior:
 *  - Caches results in scripts/.unsplash-cache.json so re-runs skip done items.
 *  - Respects the 50 req/hr demo-tier limit: sleeps 75s between calls.
 *  - Safe to Ctrl+C and resume — cache survives.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// --- Parse .env.local manually (matches other scripts in this repo)
const envContent = readFileSync(resolve(root, ".env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) {
    const k = m[1].trim();
    env[k] = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n");
  }
}

const KEY = env.UNSPLASH_ACCESS_KEY;
if (!KEY) {
  console.error("❌ UNSPLASH_ACCESS_KEY not set in .env.local");
  process.exit(1);
}

// --- Firebase Admin init
initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
  }),
});
const db = getFirestore();

// --- Cache
const CACHE_PATH = resolve(__dirname, ".unsplash-cache.json");
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf-8"))
  : {};
const saveCache = () =>
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

// --- Query-building: trim noise, append "food" for better matches
function buildQuery(name) {
  return (
    name
      .replace(/\(.*?\)/g, "") // drop "(Extra 150ml)" etc.
      .replace(/[.]/g, "")
      .replace(/\bspl\b/gi, "special")
      .replace(/\bveg\b/gi, "vegetable")
      .trim() + " indian food"
  );
}

async function searchUnsplash(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=squarish&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${KEY}` },
  });
  if (res.status === 403) {
    const body = await res.text();
    throw new Error(`Rate limited: ${body}`);
  }
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  // Use 'regular' (~1080px) and append w=400 via url params (Imgix)
  return `${hit.urls.raw}&w=400&q=80&fit=crop`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const snap = await db.collection("menuItems").get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`📋 Found ${items.length} menu items`);

  let updated = 0,
    skipped = 0,
    failed = 0;

  for (const item of items) {
    if (cache[item.name]) {
      skipped++;
      continue;
    }

    const q = buildQuery(item.name);
    process.stdout.write(`🔍 ${item.name.padEnd(40)} → "${q}" ... `);

    try {
      const url = await searchUnsplash(q);
      if (!url) {
        console.log("❌ no result");
        cache[item.name] = null; // don't retry
        failed++;
      } else {
        cache[item.name] = url;
        await db.collection("menuItems").doc(item.id).update({ imageUrl: url });
        console.log("✅");
        updated++;
      }
      saveCache();
    } catch (err) {
      console.log(`💥 ${err.message}`);
      if (err.message.startsWith("Rate limited")) {
        console.log("⏸️  Rate limit hit. Cache saved. Resume later.");
        saveCache();
        process.exit(0);
      }
      failed++;
    }

    // 50 req/hr = 1 per 72s. Use 75s to be safe.
    await sleep(75_000);
  }

  // Backfill Firestore for cached items that weren't applied (e.g. after resume)
  for (const item of items) {
    const url = cache[item.name];
    if (url && item.imageUrl !== url) {
      await db.collection("menuItems").doc(item.id).update({ imageUrl: url });
    }
  }

  console.log(
    `\n🎉 Done. Updated: ${updated}, Skipped (cached): ${skipped}, Failed: ${failed}`
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  saveCache();
  process.exit(1);
});
