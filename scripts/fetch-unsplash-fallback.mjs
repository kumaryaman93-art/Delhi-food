/**
 * fetch-unsplash-fallback.mjs
 *
 * Second pass: fills in items that the main script failed on (cache value = null).
 * Uses a simpler, category-based query instead of the full dish name.
 * Run AFTER fetch-unsplash-images.mjs finishes.
 *
 * Behavior:
 *  - Loads .unsplash-cache.json, finds items with value === null.
 *  - Looks up each item's categoryId in Firestore, maps to a simple fallback query
 *    (e.g. "paneer dish", "indian noodles", "dosa").
 *  - Applies to Firestore, updates cache, respects the 75s rate-limit.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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
  console.error("❌ UNSPLASH_ACCESS_KEY not set");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
  }),
});
const db = getFirestore();

const CACHE_PATH = resolve(__dirname, ".unsplash-cache.json");
const cache = existsSync(CACHE_PATH)
  ? JSON.parse(readFileSync(CACHE_PATH, "utf-8"))
  : {};
const saveCache = () =>
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

// Category → simpler fallback query (matches actual Firestore category names)
const CATEGORY_QUERY = {
  "Biryani & Rice":           "biryani rice indian",
  "Burger":                   "burger vegetarian",
  "Chat & Snacks":            "indian chaat street food",
  "Chinese Snacks":           "indo chinese food",
  "Fried Rice & Combo":       "fried rice chinese",
  "Hot Coffee & Beverages":   "tea coffee cup",
  "Ice Cream & Shakes":       "milkshake ice cream",
  "Indian Breads":            "naan roti indian bread",
  "Indian Main Course":       "paneer curry indian",
  "Mocktail":                 "mocktail drink glass",
  "Momos":                    "momos dumplings",
  "Noodles":                  "noodles stir fry",
  "Pasta":                    "pasta italian",
  "Pizza":                    "pizza slice",
  "Raita & Salad":            "raita salad indian",
  "Sandwich & Garlic Bread":  "grilled sandwich garlic bread",
  "Soups":                    "soup bowl hot",
  "South Indian":             "dosa idli south indian",
  "Tandoori Snacks":          "tandoori grilled paneer",
  "Wraps (Kathi Roll)":       "kathi roll wrap indian",
};

async function searchUnsplash(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=squarish&content_filter=high`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${KEY}` },
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("Rate limited");
    throw new Error(`Unsplash ${res.status}`);
  }
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) return null;
  return `${hit.urls.raw}&w=400&q=80&fit=crop`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [itemsSnap, catsSnap] = await Promise.all([
    db.collection("menuItems").get(),
    db.collection("categories").get(),
  ]);
  const cats = {};
  catsSnap.docs.forEach((d) => (cats[d.id] = d.data().name));

  const failures = itemsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((i) => cache[i.name] === null);

  console.log(`📋 ${failures.length} items need fallbacks`);
  if (failures.length === 0) return;

  let updated = 0;
  for (const item of failures) {
    const catName = cats[item.categoryId];
    const query = CATEGORY_QUERY[catName] || "indian food dish";
    process.stdout.write(
      `🔍 ${item.name.padEnd(40)} [${catName}] → "${query}" ... `
    );
    try {
      const url = await searchUnsplash(query);
      if (url) {
        cache[item.name] = url;
        await db.collection("menuItems").doc(item.id).update({ imageUrl: url });
        console.log("✅");
        updated++;
      } else {
        console.log("❌ still no result");
      }
      saveCache();
    } catch (err) {
      console.log(`💥 ${err.message}`);
      if (err.message === "Rate limited") {
        console.log("⏸️ Rate limit. Resume later.");
        saveCache();
        process.exit(0);
      }
    }
    await sleep(75_000);
  }
  console.log(`\n🎉 Fallback done. Updated ${updated} items.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  saveCache();
  process.exit(1);
});
