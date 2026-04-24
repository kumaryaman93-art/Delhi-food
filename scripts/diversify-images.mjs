/**
 * diversify-images.mjs
 *
 * Finds menu items that share the same imageUrl (because they got the same
 * fallback category query). Re-fetches each category group with per_page=30
 * and assigns a different photo to each item in the group.
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
  if (m) { const k = m[1].trim(); env[k] = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n"); }
}
const KEY = env.UNSPLASH_ACCESS_KEY;
initializeApp({ credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: env.FIREBASE_PRIVATE_KEY }) });
const db = getFirestore();

const CACHE_PATH = resolve(__dirname, ".unsplash-cache.json");
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf-8")) : {};
const saveCache = () => writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

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

async function searchPage(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=squarish&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}` } });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const data = await res.json();
  return (data.results || []).map(h => `${h.urls.raw}&w=400&q=80&fit=crop`);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const [itemsSnap, catsSnap] = await Promise.all([
    db.collection("menuItems").get(),
    db.collection("categories").get(),
  ]);
  const cats = {};
  catsSnap.docs.forEach(d => cats[d.id] = d.data().name);
  const items = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Group items by imageUrl to find duplicates
  const byUrl = {};
  for (const it of items) {
    if (!it.imageUrl) continue;
    byUrl[it.imageUrl] = byUrl[it.imageUrl] || [];
    byUrl[it.imageUrl].push(it);
  }

  // Find groups of 2+ sharing a URL
  const dupGroups = Object.entries(byUrl).filter(([_, list]) => list.length > 1);
  console.log(`📋 ${dupGroups.length} duplicate URL groups found`);

  // For each duplicate group, fetch a page of 30 photos for the category and
  // reassign a unique one to each item (keep item[0] on its current image).
  const queriesFetched = {};
  let updated = 0;

  for (const [sharedUrl, list] of dupGroups) {
    // Determine category (use the first item's category)
    const catName = cats[list[0].categoryId] || "indian food";
    const query = CATEGORY_QUERY[catName] || `${catName.toLowerCase()} food`;
    console.log(`\n🗂️  ${catName} (${list.length} items) → "${query}"`);

    // Fetch once per unique query
    if (!queriesFetched[query]) {
      try {
        queriesFetched[query] = await searchPage(query);
        console.log(`   pulled ${queriesFetched[query].length} photos`);
        await sleep(75_000); // rate limit
      } catch (e) {
        console.log(`   💥 ${e.message}`);
        continue;
      }
    }
    const pool = queriesFetched[query];
    if (pool.length === 0) { console.log("   ❌ empty pool"); continue; }

    // Assign unique photo per item (index 0, 1, 2, ...)
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      const newUrl = pool[i % pool.length];
      if (newUrl === it.imageUrl) continue; // no change
      await db.collection("menuItems").doc(it.id).update({ imageUrl: newUrl });
      cache[it.name] = newUrl;
      console.log(`   ✅ ${it.name.padEnd(40)} → photo #${i}`);
      updated++;
    }
    saveCache();
  }

  console.log(`\n🎉 Diversify done. Updated ${updated} items.`);
  process.exit(0);
}

main().catch(e => { console.error(e); saveCache(); process.exit(1); });
