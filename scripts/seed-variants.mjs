// Seeds variants (Half/Full, Small/Medium/Large) into Firestore menu items
// Run: node scripts/seed-variants.mjs
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envRaw = readFileSync(join(root, ".env.local"), "utf8");
function getEnv(k) {
  const m = envRaw.match(new RegExp(`^${k}=(.+)$`, "m"));
  if (!m) throw new Error(`Missing: ${k}`);
  return m[1].replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert({
    projectId: getEnv("FIREBASE_PROJECT_ID"),
    clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: getEnv("FIREBASE_PRIVATE_KEY"),
  })});
}
const db = admin.firestore();

// ── Variant definitions: name substring → variants array ─────────────────────
// Format: [Half price, Full price] or [Small, Medium, Large]
// Use null for "not available" (—) sizes

const HALF_FULL = (h, f) => {
  const v = [];
  if (h) v.push({ label: "Half", price: h });
  v.push({ label: "Full", price: f });
  return v;
};
const S_M_L = (s, m, l) => [
  { label: "Small", price: s },
  { label: "Medium", price: m },
  { label: "Large", price: l },
];

// Maps item name (lowercase contains match) → variants
const VARIANT_MAP = [
  // ── Chinese Snacks ───────────────────────────────────────────────────────
  { name: "chilli garlic potato",       variants: HALF_FULL(null, 150) },
  { name: "spring roll",                variants: HALF_FULL(null, 120) },
  { name: "cheese corn roll",           variants: HALF_FULL(110, 180) },
  { name: "manchurian dry",             variants: HALF_FULL(90, 150) },
  { name: "manchurian gravy",           variants: HALF_FULL(90, 150) },
  { name: "manchurian hongkong",        variants: HALF_FULL(null, 160) },
  { name: "cheese manchurian",          variants: HALF_FULL(null, 180) },
  { name: "cheese chilli dry",          variants: HALF_FULL(120, 190) },
  { name: "cheese chilli gravy",        variants: HALF_FULL(130, 200) },
  { name: "cheese finger",              variants: HALF_FULL(null, 200) },
  { name: "mushroom chilli dry",        variants: HALF_FULL(120, 190) },
  { name: "mushroom chilli gravy",      variants: HALF_FULL(140, 200) },
  { name: "mushroom duplex",            variants: HALF_FULL(null, 190) },
  { name: "crispy veg",                 variants: HALF_FULL(null, 160) },
  { name: "veg bullets",                variants: HALF_FULL(null, 160) },
  { name: "paneer singapuri",           variants: HALF_FULL(140, 220) },
  { name: "paneer hongkong",            variants: HALF_FULL(null, 220) },
  { name: "honey chilli potato",        variants: HALF_FULL(null, 160) },
  { name: "honey chilly cauliflower",   variants: HALF_FULL(null, 160) },
  { name: "honey chilli cauliflower",   variants: HALF_FULL(null, 160) },

  // ── Pizza (Small / Medium / Large) ──────────────────────────────────────
  { name: "margherita pizza",           variants: S_M_L(80, 150, 240) },
  { name: "mix veg pizza",              variants: S_M_L(100, 160, 260) },
  { name: "mix veg corn pizza",         variants: S_M_L(110, 170, 280) },
  { name: "sweet corn pizza",           variants: S_M_L(70, 150, 240) },
  { name: "aachari pizza",              variants: S_M_L(120, 170, 280) },
  { name: "tandoori pizza",             variants: S_M_L(120, 170, 280) },
  { name: "mexican pizza",              variants: S_M_L(120, 170, 280) },
  { name: "double cheese pizza",        variants: S_M_L(160, 200, 340) },
  { name: "chilly paneer pizza",        variants: S_M_L(160, 220, 420) },
  { name: "paneer tikka pizza",         variants: S_M_L(160, 220, 420) },
  { name: "makhani paneer pizza",       variants: S_M_L(160, 220, 420) },

  // ── Noodles ──────────────────────────────────────────────────────────────
  { name: "veg noodles",                variants: HALF_FULL(90, 150) },
  { name: "veg chilli garlic noodles",  variants: HALF_FULL(null, 160) },
  { name: "veg singapuri noodles",      variants: HALF_FULL(null, 160) },
  { name: "hakka noodles",              variants: HALF_FULL(null, 160) },
  { name: "veg noodles chopsuey",       variants: HALF_FULL(null, 180) },
  { name: "spanish noodles",            variants: HALF_FULL(null, 190) },
  { name: "special noodles",            variants: HALF_FULL(120, 190) },

  // ── Indian Main Course ───────────────────────────────────────────────────
  { name: "dal makhani",                variants: HALF_FULL(100, 180) },
  { name: "dal yellow",                 variants: HALF_FULL(null, 180) },
  { name: "dal punjabi tadka",          variants: HALF_FULL(null, 180) },
  { name: "chana masala",               variants: HALF_FULL(null, 180) },
  { name: "mix vegetable",              variants: HALF_FULL(100, 180) },
  { name: "nav ratan korma",            variants: HALF_FULL(null, 270) },
  { name: "mushroom mutter",            variants: HALF_FULL(null, 230) },
  { name: "mushroom do piaza",          variants: HALF_FULL(null, 230) },
  { name: "malai kofta",               variants: HALF_FULL(null, 230) },
  { name: "malai methi",               variants: HALF_FULL(null, 230) },
  { name: "cheese tomato",              variants: HALF_FULL(null, 230) },
  { name: "shahi paneer",               variants: HALF_FULL(150, 230) },
  { name: "palak paneer",               variants: HALF_FULL(null, 230) },
  { name: "paneer lababdar",            variants: HALF_FULL(null, 250) },
  { name: "paneer do piaza",            variants: HALF_FULL(null, 250) },
  { name: "karahi paneer",              variants: HALF_FULL(150, 230) },
  { name: "paneer kofta",               variants: HALF_FULL(null, 230) },
  { name: "paneer butter masala",       variants: HALF_FULL(150, 230) },
  { name: "paneer pasanda masala",      variants: HALF_FULL(null, 230) },
  { name: "rara paneer",                variants: HALF_FULL(null, 230) },
  { name: "handi paneer",               variants: HALF_FULL(null, 250) },
  { name: "paneer khurchan",            variants: HALF_FULL(null, 250) },
  { name: "makhani paneer",             variants: HALF_FULL(null, 250) },
  { name: "delhi spl. paneer begam bar",variants: HALF_FULL(null, 300) },
  { name: "delhi spl paneer begam bar", variants: HALF_FULL(null, 300) },

  // ── Tandoori Snacks ──────────────────────────────────────────────────────
  { name: "paneer tikka",               variants: HALF_FULL(120, 200) },
  { name: "paneer malai",               variants: HALF_FULL(140, 220) },
  { name: "mushroom tikka",             variants: HALF_FULL(null, 180) },
  { name: "mushroom malai tikka",       variants: HALF_FULL(null, 200) },
  { name: "snacks champ",               variants: HALF_FULL(100, 160) },
  { name: "masala champ",               variants: HALF_FULL(100, 160) },
  { name: "malai champ",                variants: HALF_FULL(120, 180) },
  { name: "aachari champ",              variants: HALF_FULL(120, 180) },
  { name: "kalimirch champ",            variants: HALF_FULL(120, 120) },
  { name: "afgani champ",               variants: HALF_FULL(140, 190) },
  { name: "mint haryali champ",         variants: HALF_FULL(120, 180) },
  { name: "butter masala gravy champ",  variants: HALF_FULL(130, 230) },
  { name: "delhi spl. champ",           variants: HALF_FULL(140, 210) },
  { name: "delhi spl champ",            variants: HALF_FULL(140, 210) },
  { name: "delhi spl. gravy champ",     variants: HALF_FULL(140, 230) },
  { name: "delhi spl gravy champ",      variants: HALF_FULL(140, 230) },
  { name: "white gravy champ",          variants: HALF_FULL(140, 230) },
];

// ── Apply to Firestore ────────────────────────────────────────────────────────
const snap = await db.collection("menuItems").get();
let updated = 0, skipped = 0;

for (const doc of snap.docs) {
  const name = (doc.data().name ?? "").toLowerCase().trim();
  const match = VARIANT_MAP.find((m) => name.includes(m.name.toLowerCase()));
  if (!match) { skipped++; continue; }

  const minPrice = Math.min(...match.variants.map((v) => v.price));
  await doc.ref.update({ variants: match.variants, price: minPrice });
  console.log(`  ✅ ${doc.data().name} → ${match.variants.map(v => `${v.label}:₹${v.price}`).join(", ")}`);
  updated++;
}

console.log(`\n✅ Done — ${updated} updated, ${skipped} items have no variants (single price).`);
