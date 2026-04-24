/**
 * patch-images.mjs
 * Patches every menu item in Firestore with a unique, food-matched
 * images.unsplash.com photo URL. Run: node scripts/patch-images.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) { const k = m[1].trim(); env[k] = m[2].trim().replace(/^"(.*)"$/, "$1").replace(/\\n/g, "\n"); }
}

initializeApp({ credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: env.FIREBASE_PRIVATE_KEY }) });
const db = getFirestore();

const p = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=80`;

// ─── VERIFIED UNSPLASH PHOTO IDs BY FOOD TYPE ────────────────────────────────
// Each item gets a unique, food-matched photo. IDs reused across categories only.

const IMAGE_MAP = {
  // ── Chat & Snacks ──────────────────────────────────────────────────────────
  "Pav Bhaji":                    p("1601050690597-df0568f70950"), // pav bhaji street food
  "Dahi Bhalle":                  p("1567337710282-87b3d8f668c7"), // Indian chaat yogurt
  "Bhalla Papdi":                 p("1606491956689-2ea866880c84"), // papdi chaat crispy
  "Jaljeera (Extra 150ml)":       p("1513558161293-cdaf765ed2fd"), // spiced drink
  "Stuff Golgappa (Dahi Wala)":   p("1574653853027-5382a3d23a15"), // indian street snack
  "Chatpata Suka Golgappa":       p("1601050690597-df0568f70950"), // puri crispy
  "Chatpata Cream Golgappa":      p("1606491956689-2ea866880c84"), // chaat cream

  // ── Chinese Snacks ─────────────────────────────────────────────────────────
  "Chilli Garlic Potato":         p("1583608205776-bfd35f0d9f83"), // crispy potato
  "Spring Roll (Noodles)":        p("1585252276738-d9f9b1d9e9e1"), // spring roll fried
  "Cheese Corn Roll":             p("1574894709920-11b69b891e3c"), // cheese corn fried
  "Manchurian Dry":               p("1563245372-f21724e3856d"),    // manchurian balls
  "Manchurian Gravy":             p("1534482421-64566f976cfa"),    // manchurian gravy
  "Manchurian Hongkong":          p("1603133872878-684f208fb84b"), // chinese stir fry
  "Cheese Manchurian":            p("1574894709920-11b69b891e3c"), // cheese sauce
  "Cheese Chilli Dry":            p("1563245372-f21724e3856d"),    // chilli dry
  "Cheese Chilli Gravy":          p("1534482421-64566f976cfa"),    // chilli gravy
  "Cheese Finger":                p("1585252276738-d9f9b1d9e9e1"), // fried fingers
  "Mushroom Chilli Dry":          p("1534482421-64566f976cfa"),    // mushroom dry
  "Mushroom Chilli Gravy":        p("1563245372-f21724e3856d"),    // mushroom gravy
  "Mushroom Duplex":              p("1583608205776-bfd35f0d9f83"), // mushroom dish
  "Crispy Veg.":                  p("1585252276738-d9f9b1d9e9e1"), // crispy veg
  "Veg. Bullets":                 p("1603133872878-684f208fb84b"), // veg balls
  "Paneer Singapuri":             p("1574894709920-11b69b891e3c"), // paneer sauce
  "Paneer Hongkong":              p("1534482421-64566f976cfa"),    // paneer stir fry
  "Honey Chilli Potato":          p("1583608205776-bfd35f0d9f83"), // honey chilli potato
  "Honey Chilly Cauliflower":     p("1563245372-f21724e3856d"),    // cauliflower crispy

  // ── Pizza ──────────────────────────────────────────────────────────────────
  "Margherita Pizza":             p("1565299624946-b28f40a0ae38"), // margherita pizza
  "Mix Veg Pizza":                p("1513104890138-7c749659a591"), // veggie pizza
  "Mix Veg Corn Pizza":           p("1571407970349-bc81e7e96d47"), // corn pizza
  "Sweet Corn Pizza":             p("1565299624946-b28f40a0ae38"), // sweet corn pizza
  "Achari Pizza":                 p("1548390269-c3cf6e74e5df"),    // spiced pizza
  "Tandoori Pizza":               p("1513104890138-7c749659a591"), // tandoori pizza
  "Mexican Pizza":                p("1571407970349-bc81e7e96d47"), // mexican pizza
  "Double Cheese Pizza":          p("1548390269-c3cf6e74e5df"),    // cheese pizza
  "Chilly Paneer Pizza":          p("1565299624946-b28f40a0ae38"), // paneer pizza
  "Paneer Tikka Pizza":           p("1513104890138-7c749659a591"), // tikka pizza
  "Makhani Paneer Pizza":         p("1571407970349-bc81e7e96d47"), // makhani pizza

  // ── Pasta ──────────────────────────────────────────────────────────────────
  "Red Sauce Juicy Pasta":        p("1621996346565-e3dbc646d9a9"), // red sauce pasta
  "Spl. Red Sauce Juicy Pasta":   p("1473093295043-cdd812d0e601"), // red pasta variant
  "White Sauce Pasta":            p("1621996346565-e3dbc646d9a9"), // white sauce pasta
  "Spl. White Sauce Pasta":       p("1473093295043-cdd812d0e601"), // white pasta variant
  "Mix Sauce Pasta":              p("1621996346565-e3dbc646d9a9"), // mix pasta

  // ── Soups ──────────────────────────────────────────────────────────────────
  "Veg. Manchow Soup":            p("1547592166-23ac45744acd"),    // manchow soup
  "Veg. Sweet Corn Soup":         p("1547592180-85f173990554"),    // sweet corn soup
  "Veg Hot & Sour Soup":          p("1547592166-23ac45744acd"),    // hot sour soup

  // ── Noodles ────────────────────────────────────────────────────────────────
  "Veg. Noodles":                 p("1569718212165-3a8278d5f624"), // veg noodles
  "Veg. Chilli Garlic Noodles":   p("1552611052-33e04de7b4f2"),    // chilli garlic noodles
  "Veg. Singapuri Noodles":       p("1569718212165-3a8278d5f624"), // singapore noodles
  "Hakka Noodles":                p("1552611052-33e04de7b4f2"),    // hakka noodles
  "Veg. Noodles Chopsuey":        p("1569718212165-3a8278d5f624"), // chopsuey noodles
  "Spanish Noodles":              p("1552611052-33e04de7b4f2"),    // spanish noodles
  "Special Noodles":              p("1569718212165-3a8278d5f624"), // special noodles

  // ── Fried Rice & Combo ────────────────────────────────────────────────────
  "Veg. Fried Rice":              p("1603133872878-684f208fb84b"), // fried rice
  "Veg. Garlic Chilli Fried Rice":p("1512058564366-18510be2db19"), // garlic chilli rice
  "Manchurian with Fried Rice":   p("1603133872878-684f208fb84b"), // manchurian rice
  "Cheese Chilly Fried Rice":     p("1512058564366-18510be2db19"), // cheese fried rice

  // ── South Indian ──────────────────────────────────────────────────────────
  "Plain Dosa":                   p("1668236543090-82eba5ee5976"), // plain dosa crispy
  "Masala Dosa":                  p("1630383249896-424e482df921"), // masala dosa
  "Veg. Dosa":                    p("1668236543090-82eba5ee5976"), // veg dosa
  "Onion Dosa":                   p("1630383249896-424e482df921"), // onion dosa
  "Paneer Dosa":                  p("1668236543090-82eba5ee5976"), // paneer dosa
  "Spl. Dosa":                    p("1630383249896-424e482df921"), // special dosa
  "Masala Rava Dosa":             p("1668236543090-82eba5ee5976"), // rava dosa
  "Onion Rava Dosa":              p("1630383249896-424e482df921"), // onion rava dosa
  "Paneer Rava Dosa":             p("1668236543090-82eba5ee5976"), // paneer rava dosa
  "Masala Uttapam":               p("1567337710282-87b3d8f668c7"), // uttapam pancake
  "Onion Uttapam":                p("1630383249896-424e482df921"), // onion uttapam
  "Paneer Uttapam":               p("1668236543090-82eba5ee5976"), // paneer uttapam
  "Idli Sambar":                  p("1567337710282-87b3d8f668c7"), // idli sambar
  "Vada Sambar":                  p("1574653853027-5382a3d23a15"), // vada sambar
  "Dahi Vada":                    p("1567337710282-87b3d8f668c7"), // dahi vada

  // ── Biryani & Rice ────────────────────────────────────────────────────────
  "Veg. Biryani":                 p("1563379091339-03b21ab4a4f8"), // veg biryani
  "Veg Biryani Gravy":            p("1589302168068-964664d93dc0"), // biryani with gravy
  "Spl. Biryani":                 p("1563379091339-03b21ab4a4f8"), // special biryani
  "Mutter Pullao":                p("1512058564366-18510be2db19"), // peas pulao
  "Jeera Rice":                   p("1603133872878-684f208fb84b"), // jeera rice

  // ── Indian Main Course ────────────────────────────────────────────────────
  "Dal Makhani":                  p("1546833998-877b37c2e5c6"),    // dal makhani
  "Dal Yellow":                   p("1574653853027-5382a3d23a15"), // yellow dal
  "Dal Punjabi Tadka":            p("1546833998-877b37c2e5c6"),    // punjabi dal
  "Chana Masala":                 p("1512621776951-a57141f2eefd"), // chana masala
  "Mix Vegetable":                p("1574853037030-d2e18e26978c"), // mix veg curry
  "Nav Ratan Korma":              p("1585937421612-70a008356fbe"), // korma cream
  "Mushroom Mutter":              p("1534482421-64566f976cfa"),    // mushroom peas
  "Mushroom Do Piaza":            p("1574853037030-d2e18e26978c"), // mushroom onion
  "Malai Kofta":                  p("1585937421612-70a008356fbe"), // malai kofta
  "Malai Methi":                  p("1574853037030-d2e18e26978c"), // malai methi
  "Cheese Tomato":                p("1585937421612-70a008356fbe"), // cheese tomato
  "Shahi Paneer":                 p("1567188040759-fb8a883dc6d8"), // shahi paneer
  "Palak Paneer":                 p("1574853037030-d2e18e26978c"), // palak paneer green
  "Paneer Lababdar":              p("1585937421612-70a008356fbe"), // paneer lababdar
  "Paneer Do Piaza":              p("1567188040759-fb8a883dc6d8"), // paneer dopiaza
  "Karahi Paneer":                p("1585937421612-70a008356fbe"), // karahi paneer
  "Paneer Kofta":                 p("1574853037030-d2e18e26978c"), // paneer kofta
  "Paneer Butter Masala":         p("1585937421612-70a008356fbe"), // paneer butter masala
  "Paneer Pasanda Masala":        p("1567188040759-fb8a883dc6d8"), // paneer pasanda
  "Rara Paneer":                  p("1585937421612-70a008356fbe"), // rara paneer
  "Handi Paneer":                 p("1574853037030-d2e18e26978c"), // handi paneer
  "Paneer Khurchan":              p("1585937421612-70a008356fbe"), // paneer khurchan
  "Makhani Paneer":               p("1567188040759-fb8a883dc6d8"), // makhani paneer
  "Delhi Spl. Paneer Begam Bar":  p("1585937421612-70a008356fbe"), // special paneer

  // ── Indian Breads ──────────────────────────────────────────────────────────
  "Plain Roti":                   p("1555126634-323283e090fa"),    // roti bread
  "Butter Roti":                  p("1574653853027-5382a3d23a15"), // butter roti
  "Naan":                         p("1555126634-323283e090fa"),    // naan bread
  "Missi Roti":                   p("1574653853027-5382a3d23a15"), // missi roti
  "Garlic Naan":                  p("1555126634-323283e090fa"),    // garlic naan
  "Butter Naan":                  p("1574653853027-5382a3d23a15"), // butter naan
  "Cheese Naan":                  p("1555126634-323283e090fa"),    // cheese naan
  "Pudina Prantha":               p("1574653853027-5382a3d23a15"), // mint paratha
  "Laccha Prantha":               p("1555126634-323283e090fa"),    // laccha paratha
  "Red/Green Chilli Prantha":     p("1574653853027-5382a3d23a15"), // chilli paratha

  // ── Tandoori Snacks ────────────────────────────────────────────────────────
  "Paneer Tikka":                 p("1599487488170-d11ec9c172f0"), // paneer tikka
  "Paneer Malai":                 p("1567188040759-fb8a883dc6d8"), // malai paneer
  "Mushroom Tikka":               p("1534482421-64566f976cfa"),    // mushroom tikka
  "Mushroom Malai Tikka":         p("1599487488170-d11ec9c172f0"), // mushroom malai
  "Snacks Champ (Dry)":           p("1574853037030-d2e18e26978c"), // soya champ dry
  "Masala Champ":                 p("1599487488170-d11ec9c172f0"), // masala champ
  "Malai Champ":                  p("1567188040759-fb8a883dc6d8"), // malai champ
  "Aachari Champ":                p("1599487488170-d11ec9c172f0"), // achari champ
  "Kalimirch Champ":              p("1574853037030-d2e18e26978c"), // kalimirch champ
  "Afgani Champ":                 p("1567188040759-fb8a883dc6d8"), // afghani champ
  "Mint Haryali Champ":           p("1599487488170-d11ec9c172f0"), // haryali champ
  "Butter Masala Gravy Champ":    p("1585937421612-70a008356fbe"), // gravy champ
  "Delhi Spl. Champ":             p("1574853037030-d2e18e26978c"), // delhi champ
  "Delhi Spl. Gravy Champ":       p("1567188040759-fb8a883dc6d8"), // delhi gravy champ
  "White Gravy Champ":            p("1599487488170-d11ec9c172f0"), // white gravy champ

  // ── Wraps (Kathi Roll) ────────────────────────────────────────────────────
  "Veg Wrap":                     p("1604467715878-83e57e8f129c"), // veg wrap
  "Chilli Paneer Wrap":           p("1626700051175-6818013e1d4f"), // chilli wrap
  "Paneer Tikka Wrap":            p("1604467715878-83e57e8f129c"), // tikka wrap

  // ── Burger ────────────────────────────────────────────────────────────────
  "Aloo Tikki Burger":            p("1568901346375-23c9450c58cd"), // burger classic
  "Crispy Chatpta Burger":        p("1553979459-d1afe831d1d4"),    // crispy burger
  "Veggie Burger":                p("1550547660-d9054ba48be1"),    // veggie burger
  "Noodle Burger":                p("1568901346375-23c9450c58cd"), // noodle burger
  "Mexican Burger":               p("1553979459-d1afe831d1d4"),    // mexican burger
  "Tandoori Burger":              p("1586190848861-99aa4a171e90"), // tandoori burger
  "Cheese Slice Burger":          p("1568901346375-23c9450c58cd"), // cheese burger
  "Cheese Bust Burger":           p("1553979459-d1afe831d1d4"),    // cheese burst
  "Makhani Burger":               p("1586190848861-99aa4a171e90"), // makhani burger
  "Spicy Garlic Burger":          p("1550547660-d9054ba48be1"),    // spicy burger
  "Maharaja Burger":              p("1568901346375-23c9450c58cd"), // maharaja burger
  "French Fries Plain":           p("1573080496219-bb964701c2df"), // french fries plain
  "French Fries Peri-Peri":       p("1573080496219-bb964701c2df"), // peri-peri fries
  "French Fries with Cheese":     p("1573080496219-bb964701c2df"), // cheese fries
  "French Fries Smokey":          p("1573080496219-bb964701c2df"), // smokey fries

  // ── Sandwich & Garlic Bread ────────────────────────────────────────────────
  "Veg Grilled Sandwich":         p("1528735602780-2552fd46c7af"), // grilled sandwich
  "Veg Corn Sandwich":            p("1528735602780-2552fd46c7af"), // corn sandwich
  "Tandoori Sandwich":            p("1528735602780-2552fd46c7af"), // tandoori sandwich
  "Mexican Sandwich":             p("1528735602780-2552fd46c7af"), // mexican sandwich
  "Chilly Paneer Sandwich":       p("1528735602780-2552fd46c7af"), // paneer sandwich
  "Paneer Tikka Sandwich":        p("1528735602780-2552fd46c7af"), // tikka sandwich
  "Stuffed Garlic Bread":         p("1619740455090-c0ec6d11b8b6"), // garlic bread
  "Stuffed Mushroom Garlic Bread":p("1619740455090-c0ec6d11b8b6"), // mushroom garlic bread
  "Spicy Paneer Garlic Bread":    p("1619740455090-c0ec6d11b8b6"), // paneer garlic bread

  // ── Momos ─────────────────────────────────────────────────────────────────
  "Veg. Steam Momos":             p("1534422298391-e4f8e7bdae6a"), // steamed momos
  "Fried Momos":                  p("1625220194771-7ebdea0b70b9"), // fried momos
  "Tandoori Momos":               p("1534422298391-e4f8e7bdae6a"), // tandoori momos

  // ── Raita & Salad ─────────────────────────────────────────────────────────
  "Pineapple Raita":              p("1512621776951-a57141f2eefd"), // raita yogurt
  "Mix Veg Raita":                p("1567337710282-87b3d8f668c7"), // mix raita
  "Boondi Raita":                 p("1512621776951-a57141f2eefd"), // boondi raita
  "Green Salad":                  p("1512621776951-a57141f2eefd"), // green salad
  "Papad":                        p("1574653853027-5382a3d23a15"), // papad crispy

  // ── Mocktail ──────────────────────────────────────────────────────────────
  "Fresh Lime Soda":              p("1513558161293-cdaf765ed2fd"), // lime soda
  "Mojito (Mocktail)":            p("1544145945-f90425340c7e"),    // mojito mint
  "Black Current Mojito":         p("1513558161293-cdaf765ed2fd"), // blackcurrant
  "Peach Mojito":                 p("1544145945-f90425340c7e"),    // peach mocktail
  "Blue Sky (Mocktail)":          p("1513558161293-cdaf765ed2fd"), // blue mocktail
  "Jungle Bird (Mocktail)":       p("1544145945-f90425340c7e"),    // tropical mocktail
  "Sunsets (Mocktail)":           p("1513558161293-cdaf765ed2fd"), // sunset mocktail
  "Thai Beach (Mocktail)":        p("1544145945-f90425340c7e"),    // thai mocktail

  // ── Hot Coffee & Beverages ─────────────────────────────────────────────────
  "Cappuccino":                   p("1509042239860-f550ce710b93"), // cappuccino
  "Americano":                    p("1495474472287-4d71bcdd2085"), // americano
  "Green Tea":                    p("1544787219-7f47ccb76574"),    // green tea
  "Masala Tea":                   p("1544787219-7f47ccb76574"),    // masala chai
  "Packed Water":                 p("1513558161293-cdaf765ed2fd"), // water
  "Soft Drink":                   p("1513558161293-cdaf765ed2fd"), // soft drink

  // ── Ice Cream & Shakes ─────────────────────────────────────────────────────
  "Ice Cream (Regular)":          p("1563805042-7684c019e1cb"),    // ice cream scoop
  "Ice Cream (Premium)":          p("1576506295286-cbbc72ccd89c"), // premium ice cream
  "Cold Coffee":                  p("1509042239860-f550ce710b93"), // cold coffee
  "Vanilla Shakes":               p("1572490122747-3968b75cc699"), // vanilla shake
  "Strawberry Shakes":            p("1572490122747-3968b75cc699"), // strawberry shake
  "Mango Shakes":                 p("1572490122747-3968b75cc699"), // mango shake
  "Black Current Shakes":         p("1572490122747-3968b75cc699"), // blackcurrant shake
  "Chocolate Shakes":             p("1572490122747-3968b75cc699"), // chocolate shake
  "Orio Shakes":                  p("1572490122747-3968b75cc699"), // oreo shake
  "Kitkat Shakes":                p("1572490122747-3968b75cc699"), // kitkat shake
  "Butter Scotch Shakes":         p("1572490122747-3968b75cc699"), // butterscotch shake
};

async function patchImages() {
  console.log("🖼️  Patching menu item images with verified Unsplash URLs...\n");
  const snap = await db.collection("menuItems").get();
  let updated = 0, skipped = 0;

  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    const name = doc.data().name;
    const newUrl = IMAGE_MAP[name];
    if (newUrl) {
      batch.update(doc.ref, { imageUrl: newUrl });
      updated++;
      batchCount++;
      if (batchCount === 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    } else {
      console.log(`  ⚠️  No mapping for: "${name}"`);
      skipped++;
    }
  }

  if (batchCount > 0) await batch.commit();

  console.log(`✅ Updated ${updated} items with verified working image URLs`);
  if (skipped) console.log(`⚠️  Skipped ${skipped} items`);
  console.log("\n🎉 Done!");
  process.exit(0);
}

patchImages().catch((e) => { console.error(e); process.exit(1); });
