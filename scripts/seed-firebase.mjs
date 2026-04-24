/**
 * Firebase Seeder — run with: node scripts/seed-firebase.mjs
 * Seeds Firestore with menu categories + items, restaurant settings,
 * and creates the admin Firebase Auth user with admin custom claim.
 *
 * Menu sourced from the physical Delhi Food Junction menu card.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── ENV LOADER ────────────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim().replace(/^"(.*)"$/, "$1");
    val = val.replace(/\\n/g, "\n");
    env[key] = val;
  }
}

// ── FIREBASE INIT ─────────────────────────────────────────────────────────────
initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
  }),
});

const db = getFirestore();
const auth = getAuth();

// ── ADMIN USER ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@delhifoodjunction.com";
const ADMIN_PASSWORD = "Admin@123";

async function createAdmin() {
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log("✅ Admin user already exists:", user.uid);
  } catch {
    user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: "Admin",
    });
    console.log("✅ Admin user created:", user.uid);
  }
  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log("✅ Admin claim set");
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
async function seedSettings() {
  await db.collection("settings").doc("restaurant").set(
    {
      restaurantName: "Delhi Food Junction",
      tagline: "100% Pure Vegetarian",
      address: "Netaji Nagar, Salem Tabri, Ludhiana",
      phone: "099147 55509",
      logoUrl: null,
      heroImageUrl: null,
      gstRate: 5,
      packagingFee: 20,
      isOpen: true,
      acceptCOD: true,
      acceptOnline: true,
      defaultEta: 20,
      dineInEnabled: true,
      takeawayEnabled: true,
      deliveryEnabled: false,
      soundEnabled: true,
    },
    { merge: true }
  );
  console.log("✅ Settings seeded");
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
// Keyword-based Unsplash URL — unique image per food item
const img = (keywords) =>
  `https://source.unsplash.com/400x300/?${encodeURIComponent(keywords)}`;

// ── CATEGORIES ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "chat-snacks",      name: "Chat & Snacks",           emoji: "🥗", displayOrder: 1  },
  { id: "chinese-snacks",   name: "Chinese Snacks",          emoji: "🥡", displayOrder: 2  },
  { id: "pizza",            name: "Pizza",                   emoji: "🍕", displayOrder: 3  },
  { id: "pasta",            name: "Pasta",                   emoji: "🍝", displayOrder: 4  },
  { id: "soups",            name: "Soups",                   emoji: "🍲", displayOrder: 5  },
  { id: "noodles",          name: "Noodles",                 emoji: "🍜", displayOrder: 6  },
  { id: "fried-rice",       name: "Fried Rice & Combo",      emoji: "🍚", displayOrder: 7  },
  { id: "south-indian",     name: "South Indian",            emoji: "🥞", displayOrder: 8  },
  { id: "biryani-rice",     name: "Biryani & Rice",          emoji: "🫕", displayOrder: 9  },
  { id: "indian-main",      name: "Indian Main Course",      emoji: "🍛", displayOrder: 10 },
  { id: "indian-breads",    name: "Indian Breads",           emoji: "🫓", displayOrder: 11 },
  { id: "tandoori-snacks",  name: "Tandoori Snacks",         emoji: "🍢", displayOrder: 12 },
  { id: "wraps",            name: "Wraps (Kathi Roll)",      emoji: "🌯", displayOrder: 13 },
  { id: "burgers",          name: "Burger",                  emoji: "🍔", displayOrder: 14 },
  { id: "sandwiches",       name: "Sandwich & Garlic Bread", emoji: "🥪", displayOrder: 15 },
  { id: "momos",            name: "Momos",                   emoji: "🥟", displayOrder: 16 },
  { id: "raita-salad",      name: "Raita & Salad",           emoji: "🥙", displayOrder: 17 },
  { id: "mocktails",        name: "Mocktail",                emoji: "🧃", displayOrder: 18 },
  { id: "hot-beverages",    name: "Hot Coffee & Beverages",  emoji: "☕", displayOrder: 19 },
  { id: "ice-cream-shakes", name: "Ice Cream & Shakes",      emoji: "🍦", displayOrder: 20 },
];

// ── MENU ITEMS ────────────────────────────────────────────────────────────────
// isFeatured: true for popular picks across categories
const MENU_ITEMS = [

  // ── Chat & Snacks ──────────────────────────────────────────────────────────
  {
    categoryId: "chat-snacks", displayOrder: 1,
    name: "Pav Bhaji", price: 80,
    description: "Buttery mashed vegetable curry served with soft toasted pav — a Mumbai street-food classic.",
    imageUrl: "https://source.unsplash.com/400x300/?pav%20bhaji%20indian%20street%20food%20butter%20spicy",
    isFeatured: true,
  },
  {
    categoryId: "chat-snacks", displayOrder: 2,
    name: "Dahi Bhalle", price: 50,
    description: "Soft lentil dumplings dunked in chilled yoghurt with tangy tamarind and green chutneys.",
    imageUrl: "https://source.unsplash.com/400x300/?dahi%20bhalle%20yogurt%20lentil%20dumpling%20chaat",
    isFeatured: false,
  },
  {
    categoryId: "chat-snacks", displayOrder: 3,
    name: "Bhalla Papdi", price: 50,
    description: "Crispy papdi layered with dahi, boondi and zesty chutneys for the perfect chaat bite.",
    imageUrl: "https://source.unsplash.com/400x300/?papdi%20chaat%20crispy%20indian%20snack%20tamarind",
    isFeatured: false,
  },
  {
    categoryId: "chat-snacks", displayOrder: 4,
    name: "Jaljeera (Extra 150ml)", price: 20,
    description: "Refreshing cumin-spiced water with a tangy twist — the original Indian cooler.",
    imageUrl: "https://source.unsplash.com/400x300/?jaljeera%20spiced%20cumin%20water%20indian%20cooler%20drink",
    isFeatured: false,
  },
  {
    categoryId: "chat-snacks", displayOrder: 5,
    name: "Stuff Golgappa (Dahi Wala)", price: 60,
    description: "Crispy puris stuffed with spiced potato and topped with creamy sweetened dahi.",
    imageUrl: "https://source.unsplash.com/400x300/?golgappa%20pani%20puri%20indian%20street%20food%20dahi",
    isFeatured: false,
  },
  {
    categoryId: "chat-snacks", displayOrder: 6,
    name: "Chatpata Suka Golgappa", price: 10,
    description: "Dry, tangy golgappa coated in spicy masala — an addictive on-the-go snack.",
    imageUrl: "https://source.unsplash.com/400x300/?dry%20golgappa%20puri%20crispy%20masala%20spicy%20snack",
    isFeatured: false,
  },
  {
    categoryId: "chat-snacks", displayOrder: 7,
    name: "Chatpata Cream Golgappa", price: 15,
    description: "Golgappa tossed in a creamy, chatpata blend that explodes with flavour in every bite.",
    imageUrl: "https://source.unsplash.com/400x300/?cream%20golgappa%20chaat%20chatpata%20yogurt",
    isFeatured: false,
  },

  // ── Chinese Snacks ─────────────────────────────────────────────────────────
  {
    categoryId: "chinese-snacks", displayOrder: 1,
    name: "Chilli Garlic Potato", price: 150,
    description: "Crispy potato tossed in fiery chilli-garlic sauce — a crowd-pleasing starter.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20garlic%20potato%20crispy%20fried%20snack",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 2,
    name: "Spring Roll (Noodles)", price: 150,
    description: "Golden fried rolls packed with spiced noodles and crunchy vegetables.",
    imageUrl: "https://source.unsplash.com/400x300/?spring%20roll%20fried%20golden%20noodle%20chinese",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 3,
    name: "Cheese Corn Roll", price: 180,
    description: "Crispy rolls bursting with melted cheese and sweet corn — irresistibly gooey.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20corn%20roll%20fried%20crispy%20golden%20snack",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 4,
    name: "Manchurian Dry", price: 150,
    description: "Crispy veg balls tossed in a bold Indo-Chinese manchurian sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?manchurian%20dry%20veg%20balls%20indo%20chinese%20spicy",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 5,
    name: "Manchurian Gravy", price: 150,
    description: "Soft veg balls simmered in a rich, saucy manchurian gravy — pairs well with rice.",
    imageUrl: "https://source.unsplash.com/400x300/?manchurian%20gravy%20sauce%20chinese%20indian%20bowl",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 6,
    name: "Manchurian Hongkong", price: 160,
    description: "A Hongkong-style twist on classic manchurian with extra aromatic sauces.",
    imageUrl: "https://source.unsplash.com/400x300/?hongkong%20chinese%20stir%20fry%20aromatic%20sauce",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 7,
    name: "Cheese Manchurian", price: 180,
    description: "Manchurian balls loaded with gooey melted cheese for an indulgent upgrade.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20manchurian%20melted%20gooey%20chinese%20food",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 8,
    name: "Cheese Chilli Dry", price: 190,
    description: "Spicy chilli-tossed bites smothered in stretchy cheese — totally addictive.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20paneer%20dry%20spicy%20pepper%20chinese%20snack",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 9,
    name: "Cheese Chilli Gravy", price: 200,
    description: "Cheese chilli in a luscious gravy base — scoop it up with fried rice.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20cheese%20gravy%20sauce%20chinese%20food",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 10,
    name: "Cheese Finger", price: 200,
    description: "Long, crispy cheese fingers fried to a perfect golden crunch.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20sticks%20fingers%20fried%20crispy%20golden",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 11,
    name: "Mushroom Chilli Dry", price: 190,
    description: "Tender mushrooms stir-fried with chilli and peppers in a dry, fragrant glaze.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20chilli%20dry%20stir%20fry%20garlic",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 12,
    name: "Mushroom Chilli Gravy", price: 200,
    description: "Juicy mushrooms bathed in a spicy chilli gravy — a must-have for mushroom lovers.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20chilli%20gravy%20spicy%20sauce",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 13,
    name: "Mushroom Duplex", price: 190,
    description: "A chef's special mushroom preparation with a double-sauce duplex flavour profile.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20sauteed%20garlic%20butter%20sauce",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 14,
    name: "Crispy Veg.", price: 160,
    description: "Assorted vegetables battered and fried to an irresistible crispy finish.",
    imageUrl: "https://source.unsplash.com/400x300/?crispy%20battered%20fried%20mixed%20vegetables",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 15,
    name: "Veg. Bullets", price: 160,
    description: "Bite-sized veggie bullets packed with spice and tossed in a tangy sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20balls%20fried%20spicy%20tangy%20snack",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 16,
    name: "Paneer Singapuri", price: 220,
    description: "Paneer cubes in a fragrant Singaporean-style sauce with a hint of coconut.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20singapore%20style%20coconut%20spice",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 17,
    name: "Paneer Hongkong", price: 220,
    description: "Paneer tossed in a Hongkong-style glaze — sweet, spicy, and deeply savoury.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20stir%20fry%20sweet%20spicy%20chinese%20glaze",
    isFeatured: false,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 18,
    name: "Honey Chilli Potato", price: 160,
    description: "Crispy potato fingers drizzled with honey-chilli sauce — sweet heat at its best.",
    imageUrl: "https://source.unsplash.com/400x300/?honey%20chilli%20potato%20sweet%20spicy%20crispy",
    isFeatured: true,
  },
  {
    categoryId: "chinese-snacks", displayOrder: 19,
    name: "Honey Chilly Cauliflower", price: 160,
    description: "Crunchy cauliflower florets glazed with sticky honey-chilli sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?honey%20chilli%20cauliflower%20glazed%20crispy",
    isFeatured: false,
  },

  // ── Pizza ──────────────────────────────────────────────────────────────────
  {
    categoryId: "pizza", displayOrder: 1,
    name: "Margherita Pizza", price: 150,
    description: "Classic thin-crust pizza with rich tomato sauce and gooey mozzarella cheese.",
    imageUrl: "https://source.unsplash.com/400x300/?margherita%20pizza%20tomato%20mozzarella%20basil",
    isFeatured: true,
  },
  {
    categoryId: "pizza", displayOrder: 2,
    name: "Mix Veg Pizza", price: 160,
    description: "A colourful medley of fresh vegetables on a crispy pizza base.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20pizza%20colorful%20bell%20pepper%20onion",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 3,
    name: "Mix Veg Corn Pizza", price: 170,
    description: "Loaded with mixed veggies and sweet corn for a satisfying crunch.",
    imageUrl: "https://source.unsplash.com/400x300/?corn%20vegetable%20pizza%20sweet%20corn%20topping%20cheese",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 4,
    name: "Sweet Corn Pizza", price: 150,
    description: "Mildly sweet corn kernels over tangy tomato sauce and melted cheese.",
    imageUrl: "https://source.unsplash.com/400x300/?sweet%20corn%20cheese%20pizza%20slice%20baked",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 5,
    name: "Achari Pizza", price: 170,
    description: "Tangy pickle-spiced pizza topping that gives every bite a desi twist.",
    imageUrl: "https://source.unsplash.com/400x300/?spiced%20indian%20pizza%20pickle%20masala%20topping",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 6,
    name: "Tandoori Pizza", price: 170,
    description: "Tandoori-marinated veggies on a pizza base with smoky charred flavours.",
    imageUrl: "https://source.unsplash.com/400x300/?tandoori%20pizza%20grilled%20smoky%20indian%20spiced",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 7,
    name: "Mexican Pizza", price: 170,
    description: "Spicy Mexican-style toppings with jalapeños, peppers, and salsa sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?mexican%20pizza%20jalapeno%20bell%20pepper%20salsa",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 8,
    name: "Double Cheese Pizza", price: 200,
    description: "Extra generous double-cheese topping for the ultimate cheese pull experience.",
    imageUrl: "https://source.unsplash.com/400x300/?double%20cheese%20pizza%20mozzarella%20stretch%20pull",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 9,
    name: "Chilly Paneer Pizza", price: 220,
    description: "Spicy chilli paneer tossed on a pizza — a bold fusion of Indian and Italian.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20chilli%20pizza%20fusion%20spicy%20indian",
    isFeatured: false,
  },
  {
    categoryId: "pizza", displayOrder: 10,
    name: "Paneer Tikka Pizza", price: 220,
    description: "Smoky marinated paneer tikka on a cheese-laden pizza base.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20tikka%20pizza%20grilled%20smoky%20indian",
    isFeatured: true,
  },
  {
    categoryId: "pizza", displayOrder: 11,
    name: "Makhani Paneer Pizza", price: 220,
    description: "Creamy makhani-sauced paneer atop a cheesy pizza — rich and indulgent.",
    imageUrl: "https://source.unsplash.com/400x300/?makhani%20butter%20paneer%20pizza%20creamy%20sauce",
    isFeatured: false,
  },

  // ── Pasta ──────────────────────────────────────────────────────────────────
  {
    categoryId: "pasta", displayOrder: 1,
    name: "Red Sauce Juicy Pasta", price: 170,
    description: "Al dente pasta in a juicy, herb-infused tomato arrabbiata sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?red%20sauce%20arrabbiata%20pasta%20tomato%20herb",
    isFeatured: false,
  },
  {
    categoryId: "pasta", displayOrder: 2,
    name: "Spl. Red Sauce Juicy Pasta", price: 210,
    description: "Chef's special red sauce pasta loaded with extra veggies and seasoning.",
    imageUrl: "https://source.unsplash.com/400x300/?special%20red%20sauce%20pasta%20loaded%20vegetables",
    isFeatured: false,
  },
  {
    categoryId: "pasta", displayOrder: 3,
    name: "White Sauce Pasta", price: 180,
    description: "Creamy béchamel-coated pasta with a smooth, velvety finish.",
    imageUrl: "https://source.unsplash.com/400x300/?white%20cream%20sauce%20pasta%20bechamel%20creamy",
    isFeatured: true,
  },
  {
    categoryId: "pasta", displayOrder: 4,
    name: "Spl. White Sauce Pasta", price: 220,
    description: "Chef's special white sauce pasta with premium toppings and extra creaminess.",
    imageUrl: "https://source.unsplash.com/400x300/?creamy%20white%20sauce%20pasta%20premium%20rich",
    isFeatured: false,
  },
  {
    categoryId: "pasta", displayOrder: 5,
    name: "Mix Sauce Pasta", price: 250,
    description: "The best of both worlds — tangy red and creamy white sauce blended together.",
    imageUrl: "https://source.unsplash.com/400x300/?pasta%20red%20white%20mixed%20sauce%20creamy%20tomato",
    isFeatured: true,
  },

  // ── Soups ──────────────────────────────────────────────────────────────────
  {
    categoryId: "soups", displayOrder: 1,
    name: "Veg. Manchow Soup", price: 60,
    description: "Hearty Chinese-style soup with crispy noodles on top — warming and flavourful.",
    imageUrl: "https://source.unsplash.com/400x300/?manchow%20soup%20noodles%20chinese%20vegetable%20bowl",
    isFeatured: false,
  },
  {
    categoryId: "soups", displayOrder: 2,
    name: "Veg. Sweet Corn Soup", price: 60,
    description: "Silky, mildly sweet corn soup — a comforting bowl of goodness.",
    imageUrl: "https://source.unsplash.com/400x300/?sweet%20corn%20soup%20creamy%20warm%20bowl",
    isFeatured: false,
  },
  {
    categoryId: "soups", displayOrder: 3,
    name: "Veg Hot & Sour Soup", price: 80,
    description: "Tangy and fiery hot-and-sour soup loaded with vegetables and tofu.",
    imageUrl: "https://source.unsplash.com/400x300/?hot%20sour%20soup%20chinese%20spicy%20tangy%20tofu",
    isFeatured: false,
  },

  // ── Noodles ────────────────────────────────────────────────────────────────
  {
    categoryId: "noodles", displayOrder: 1,
    name: "Veg. Noodles", price: 150,
    description: "Classic stir-fried vegetable noodles cooked in Indo-Chinese style.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20noodles%20stir%20fry%20indo%20chinese",
    isFeatured: false,
  },
  {
    categoryId: "noodles", displayOrder: 2,
    name: "Veg. Chilli Garlic Noodles", price: 160,
    description: "Fiery chilli-garlic noodles with a punch of heat in every forkful.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20garlic%20noodles%20spicy%20stir%20fry",
    isFeatured: false,
  },
  {
    categoryId: "noodles", displayOrder: 3,
    name: "Veg. Singapuri Noodles", price: 160,
    description: "Thin rice noodles tossed in aromatic Singaporean spices and vegetables.",
    imageUrl: "https://source.unsplash.com/400x300/?singapore%20noodles%20thin%20rice%20spiced",
    isFeatured: false,
  },
  {
    categoryId: "noodles", displayOrder: 4,
    name: "Hakka Noodles", price: 160,
    description: "Authentic Hakka-style noodles wok-tossed with crisp vegetables.",
    imageUrl: "https://source.unsplash.com/400x300/?hakka%20noodles%20wok%20tossed%20vegetables",
    isFeatured: false,
  },
  {
    categoryId: "noodles", displayOrder: 5,
    name: "Veg. Noodles Chopsuey", price: 180,
    description: "Crispy noodles topped with a thick, saucy stir-fried vegetable chopsuey.",
    imageUrl: "https://source.unsplash.com/400x300/?chopsuey%20crispy%20noodles%20sauce%20stir%20fry",
    isFeatured: false,
  },
  {
    categoryId: "noodles", displayOrder: 6,
    name: "Spanish Noodles", price: 190,
    description: "Noodles prepared in a tangy Spanish-inspired sauce with colourful peppers.",
    imageUrl: "https://source.unsplash.com/400x300/?spanish%20noodles%20pepper%20colorful%20sauce",
    isFeatured: false,
  },
  {
    categoryId: "noodles", displayOrder: 7,
    name: "Special Noodles", price: 190,
    description: "Chef's special noodles loaded with a secret blend of sauces and premium veggies.",
    imageUrl: "https://source.unsplash.com/400x300/?special%20chef%20noodles%20sauce%20premium%20stir%20fry",
    isFeatured: false,
  },

  // ── Fried Rice & Combo ────────────────────────────────────────────────────
  {
    categoryId: "fried-rice", displayOrder: 1,
    name: "Veg. Fried Rice", price: 100,
    description: "Wok-tossed basmati rice with fresh vegetables and soy — a simple classic.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20fried%20rice%20wok%20basmati%20soy",
    isFeatured: false,
  },
  {
    categoryId: "fried-rice", displayOrder: 2,
    name: "Veg. Garlic Chilli Fried Rice", price: 120,
    description: "Fried rice amped up with bold garlic and chilli for an extra kick.",
    imageUrl: "https://source.unsplash.com/400x300/?garlic%20chilli%20fried%20rice%20spicy%20bold",
    isFeatured: false,
  },
  {
    categoryId: "fried-rice", displayOrder: 3,
    name: "Manchurian with Fried Rice", price: 140,
    description: "A perfect combo — saucy manchurian served alongside hot fried rice.",
    imageUrl: "https://source.unsplash.com/400x300/?manchurian%20fried%20rice%20combo%20chinese%20plate",
    isFeatured: false,
  },
  {
    categoryId: "fried-rice", displayOrder: 4,
    name: "Cheese Chilly Fried Rice", price: 160,
    description: "Fried rice topped with spicy chilli and a generous blanket of melted cheese.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20chilli%20fried%20rice%20melted%20spicy",
    isFeatured: false,
  },

  // ── South Indian ──────────────────────────────────────────────────────────
  {
    categoryId: "south-indian", displayOrder: 1,
    name: "Plain Dosa", price: 100,
    description: "Thin, crispy fermented rice crepe served with sambar and coconut chutney.",
    imageUrl: "https://source.unsplash.com/400x300/?plain%20dosa%20crispy%20thin%20rice%20crepe%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 2,
    name: "Masala Dosa", price: 120,
    description: "Crispy dosa stuffed with spiced potato masala — the South Indian staple.",
    imageUrl: "https://source.unsplash.com/400x300/?masala%20dosa%20potato%20stuffed%20crispy%20south%20indian",
    isFeatured: true,
  },
  {
    categoryId: "south-indian", displayOrder: 3,
    name: "Veg. Dosa", price: 130,
    description: "Dosa filled with a colourful mix of sautéed vegetables and spices.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20dosa%20stuffed%20colorful%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 4,
    name: "Onion Dosa", price: 130,
    description: "Lacy dosa topped with crispy caramelised onions and green chillies.",
    imageUrl: "https://source.unsplash.com/400x300/?onion%20dosa%20caramelized%20crispy%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 5,
    name: "Paneer Dosa", price: 150,
    description: "Dosa stuffed with spiced crumbled paneer for a protein-rich delight.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20dosa%20stuffed%20cottage%20cheese%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 6,
    name: "Spl. Dosa", price: 160,
    description: "Chef's special dosa with a signature filling and house-made chutney.",
    imageUrl: "https://source.unsplash.com/400x300/?special%20dosa%20chef%20signature%20crispy%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 7,
    name: "Masala Rava Dosa", price: 140,
    description: "Crispy semolina dosa with a spiced potato filling — light and crunchy.",
    imageUrl: "https://source.unsplash.com/400x300/?rava%20semolina%20masala%20dosa%20crispy%20light",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 8,
    name: "Onion Rava Dosa", price: 150,
    description: "Thin rava dosa loaded with onions — an irresistibly crunchy treat.",
    imageUrl: "https://source.unsplash.com/400x300/?onion%20rava%20dosa%20thin%20crispy%20semolina",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 9,
    name: "Paneer Rava Dosa", price: 160,
    description: "Semolina dosa stuffed with spiced paneer — crispy outside, rich inside.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20rava%20semolina%20dosa%20stuffed%20crispy",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 10,
    name: "Masala Uttapam", price: 140,
    description: "Thick, soft rice pancake topped with spiced vegetable masala.",
    imageUrl: "https://source.unsplash.com/400x300/?masala%20uttapam%20thick%20rice%20pancake%20vegetables",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 11,
    name: "Onion Uttapam", price: 160,
    description: "Fluffy uttapam generously topped with onions and green chillies.",
    imageUrl: "https://source.unsplash.com/400x300/?onion%20uttapam%20soft%20pancake%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 12,
    name: "Paneer Uttapam", price: 180,
    description: "Soft uttapam crowned with spiced paneer — hearty and flavourful.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20uttapam%20thick%20soft%20rice%20pancake",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 13,
    name: "Idli Sambar", price: 120,
    description: "Steamed idlis served with a bowl of tangy sambar and coconut chutney.",
    imageUrl: "https://source.unsplash.com/400x300/?idli%20sambar%20steamed%20rice%20cake%20lentil%20soup",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 14,
    name: "Vada Sambar", price: 120,
    description: "Crispy medu vadas served with lentil sambar and fresh coconut chutney.",
    imageUrl: "https://source.unsplash.com/400x300/?medu%20vada%20sambar%20crispy%20lentil%20donut%20south%20indian",
    isFeatured: false,
  },
  {
    categoryId: "south-indian", displayOrder: 15,
    name: "Dahi Vada", price: 100,
    description: "Soft vadas soaked in chilled sweetened yoghurt with chutney drizzle.",
    imageUrl: "https://source.unsplash.com/400x300/?dahi%20vada%20yogurt%20lentil%20dumpling%20sweet%20chutney",
    isFeatured: false,
  },

  // ── Biryani & Rice ────────────────────────────────────────────────────────
  {
    categoryId: "biryani-rice", displayOrder: 1,
    name: "Veg. Biryani", price: 180,
    description: "Aromatic long-grain basmati layered with vegetables and whole spices.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20biryani%20aromatic%20basmati%20spices",
    isFeatured: true,
  },
  {
    categoryId: "biryani-rice", displayOrder: 2,
    name: "Veg Biryani Gravy", price: 230,
    description: "Veg biryani served with a rich, slow-cooked curry gravy on the side.",
    imageUrl: "https://source.unsplash.com/400x300/?veg%20biryani%20gravy%20curry%20rice%20aromatic",
    isFeatured: false,
  },
  {
    categoryId: "biryani-rice", displayOrder: 3,
    name: "Spl. Biryani", price: 200,
    description: "Chef's signature biryani with a special blend of spices and premium ingredients.",
    imageUrl: "https://source.unsplash.com/400x300/?special%20biryani%20chef%20signature%20rice%20spiced",
    isFeatured: false,
  },
  {
    categoryId: "biryani-rice", displayOrder: 4,
    name: "Mutter Pullao", price: 150,
    description: "Fragrant basmati rice cooked with fresh green peas and whole spices.",
    imageUrl: "https://source.unsplash.com/400x300/?mutter%20peas%20pulao%20basmati%20rice%20fragrant",
    isFeatured: false,
  },
  {
    categoryId: "biryani-rice", displayOrder: 5,
    name: "Jeera Rice", price: 130,
    description: "Steamed basmati tempered with cumin seeds and a hint of ghee.",
    imageUrl: "https://source.unsplash.com/400x300/?jeera%20rice%20cumin%20basmati%20steamed%20ghee",
    isFeatured: false,
  },

  // ── Indian Main Course ────────────────────────────────────────────────────
  {
    categoryId: "indian-main", displayOrder: 1,
    name: "Dal Makhani", price: 180,
    description: "Slow-cooked black lentils in a buttery tomato-cream sauce — a Punjab legend.",
    imageUrl: "https://source.unsplash.com/400x300/?dal%20makhani%20black%20lentil%20butter%20cream%20punjabi",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 2,
    name: "Dal Yellow", price: 180,
    description: "Light, comforting yellow lentil dal tempered with cumin and turmeric.",
    imageUrl: "https://source.unsplash.com/400x300/?yellow%20dal%20lentil%20tadka%20turmeric%20bowl",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 3,
    name: "Dal Punjabi Tadka", price: 180,
    description: "Rustic Punjabi-style dal with a sizzling ghee and spice tadka poured on top.",
    imageUrl: "https://source.unsplash.com/400x300/?punjabi%20dal%20tadka%20ghee%20spice%20sizzling",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 4,
    name: "Chana Masala", price: 180,
    description: "Bold chickpea curry cooked with tangy tomatoes and aromatic spices.",
    imageUrl: "https://source.unsplash.com/400x300/?chana%20masala%20chickpea%20curry%20spiced%20tomato",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 5,
    name: "Mix Vegetable", price: 180,
    description: "Seasonal vegetables simmered in a rich, mildly spiced tomato-onion gravy.",
    imageUrl: "https://source.unsplash.com/400x300/?mix%20vegetable%20curry%20indian%20gravy%20seasonal",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 6,
    name: "Nav Ratan Korma", price: 270,
    description: "Nine gems of vegetables and dry fruits in a velvety, mildly sweet korma sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?navratan%20korma%20nine%20vegetable%20korma%20cream%20nuts",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 7,
    name: "Mushroom Mutter", price: 230,
    description: "Earthy mushrooms and green peas in a fragrant, spiced tomato gravy.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20mutter%20peas%20curry%20tomato%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 8,
    name: "Mushroom Do Piaza", price: 230,
    description: "Mushrooms cooked with double onions for a bold, caramelised depth of flavour.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20do%20pyaza%20double%20onion%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 9,
    name: "Malai Kofta", price: 230,
    description: "Soft paneer and potato koftas in a luscious cream-tomato malai gravy.",
    imageUrl: "https://source.unsplash.com/400x300/?malai%20kofta%20paneer%20potato%20dumpling%20cream%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 10,
    name: "Malai Methi", price: 230,
    description: "Creamy fenugreek-laced curry with a subtle bitterness balanced by rich malai.",
    imageUrl: "https://source.unsplash.com/400x300/?malai%20methi%20fenugreek%20cream%20curry",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 11,
    name: "Cheese Tomato", price: 230,
    description: "Tangy tomato curry enriched with melted cheese — comfort food at its finest.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20tomato%20curry%20melted%20indian",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 12,
    name: "Shahi Paneer", price: 230,
    description: "Royal paneer curry in a cashew-cream gravy — rich, indulgent, and aromatic.",
    imageUrl: "https://source.unsplash.com/400x300/?shahi%20paneer%20royal%20cream%20cashew%20gravy%20indian",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 13,
    name: "Palak Paneer", price: 230,
    description: "Fresh cottage cheese cubes nestled in a vibrant, spiced spinach purée.",
    imageUrl: "https://source.unsplash.com/400x300/?palak%20paneer%20spinach%20cottage%20cheese%20green%20curry",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 14,
    name: "Paneer Lababdar", price: 230,
    description: "Paneer in a slow-simmered, tangy tomato-onion gravy with bold spices.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20lababdar%20tomato%20onion%20spiced%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 15,
    name: "Paneer Do Piaza", price: 250,
    description: "Paneer cooked with doubled onions, giving a sweet and deeply savoury gravy.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20do%20pyaza%20double%20onion%20caramelized",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 16,
    name: "Karahi Paneer", price: 230,
    description: "Paneer cooked fresh in an iron karahi with tomatoes, peppers, and spices.",
    imageUrl: "https://source.unsplash.com/400x300/?karahi%20paneer%20iron%20wok%20tomato%20pepper%20spiced",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 17,
    name: "Paneer Kofta", price: 230,
    description: "Fried paneer koftas dipped in a silky, fragrant gravy — a true indulgence.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20kofta%20fried%20dumpling%20cream%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 18,
    name: "Paneer Butter Masala", price: 230,
    description: "Silky paneer in buttery tomato-cream makhani sauce — the ultimate favourite.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20butter%20masala%20makhani%20cream%20tomato",
    isFeatured: true,
  },
  {
    categoryId: "indian-main", displayOrder: 19,
    name: "Paneer Pasanda Masala", price: 230,
    description: "Stuffed paneer slices in a rich, nutty Mughlai-inspired gravy.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20pasanda%20stuffed%20mughlai%20nutty%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 20,
    name: "Rara Paneer", price: 230,
    description: "Paneer in a thick, robust gravy with a unique Punjabi rara preparation.",
    imageUrl: "https://source.unsplash.com/400x300/?rara%20paneer%20thick%20punjabi%20robust%20gravy",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 21,
    name: "Handi Paneer", price: 230,
    description: "Slow-cooked paneer in a clay handi for a smoky, intensely flavoured curry.",
    imageUrl: "https://source.unsplash.com/400x300/?handi%20paneer%20clay%20pot%20slow%20cooked%20smoky",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 22,
    name: "Paneer Khurchan", price: 250,
    description: "Shredded paneer stir-fried with onions and bell peppers in a dry-style masala.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20khurchan%20shredded%20stir%20fry%20dry%20masala",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 23,
    name: "Makhani Paneer", price: 250,
    description: "Paneer tossed in a butter-rich makhani sauce — creamy, tangy, and irresistible.",
    imageUrl: "https://source.unsplash.com/400x300/?makhani%20paneer%20butter%20rich%20creamy%20tomato",
    isFeatured: false,
  },
  {
    categoryId: "indian-main", displayOrder: 24,
    name: "Delhi Spl. Paneer Begam Bar", price: 300,
    description: "Our signature royal paneer dish — a chef's masterpiece exclusive to Delhi Food Junction.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20begam%20bar%20royal%20signature%20delhi%20special",
    isFeatured: false,
  },

  // ── Indian Breads ──────────────────────────────────────────────────────────
  {
    categoryId: "indian-breads", displayOrder: 1,
    name: "Plain Roti", price: 10,
    description: "Soft whole wheat roti baked in the tandoor — a wholesome everyday staple.",
    imageUrl: "https://source.unsplash.com/400x300/?plain%20roti%20tandoor%20wheat%20bread%20indian",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 2,
    name: "Butter Roti", price: 15,
    description: "Tandoor-fresh roti brushed with a generous knob of melted butter.",
    imageUrl: "https://source.unsplash.com/400x300/?butter%20roti%20tandoor%20fresh%20wheat%20melted%20butter",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 3,
    name: "Naan", price: 30,
    description: "Soft, pillowy leavened flatbread from the tandoor — perfect with any curry.",
    imageUrl: "https://source.unsplash.com/400x300/?naan%20bread%20tandoor%20leavened%20soft%20pillowy",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 4,
    name: "Missi Roti", price: 30,
    description: "Rustic chickpea flour flatbread spiced with ajwain and fresh herbs.",
    imageUrl: "https://source.unsplash.com/400x300/?missi%20roti%20chickpea%20flour%20herb%20spiced%20flatbread",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 5,
    name: "Garlic Naan", price: 60,
    description: "Naan topped with minced garlic and butter — fragrant and absolutely delicious.",
    imageUrl: "https://source.unsplash.com/400x300/?garlic%20naan%20tandoor%20minced%20garlic%20butter%20fragrant",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 6,
    name: "Butter Naan", price: 40,
    description: "Classic naan slathered with butter — soft, fluffy, and perfectly golden.",
    imageUrl: "https://source.unsplash.com/400x300/?butter%20naan%20fluffy%20golden%20tandoor",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 7,
    name: "Cheese Naan", price: 90,
    description: "Naan stuffed with gooey melted cheese — a rich, indulgent bread course.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20naan%20stuffed%20melted%20gooey%20bread",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 8,
    name: "Pudina Prantha", price: 50,
    description: "Flaky whole wheat paratha infused with refreshing fresh mint leaves.",
    imageUrl: "https://source.unsplash.com/400x300/?pudina%20mint%20paratha%20flaky%20layered%20fresh",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 9,
    name: "Laccha Prantha", price: 30,
    description: "Multi-layered crispy paratha with a satisfying flaky texture.",
    imageUrl: "https://source.unsplash.com/400x300/?laccha%20paratha%20multi%20layer%20crispy%20flaky",
    isFeatured: false,
  },
  {
    categoryId: "indian-breads", displayOrder: 10,
    name: "Red/Green Chilli Prantha", price: 50,
    description: "Spicy chilli-stuffed paratha for those who like it hot.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20stuffed%20paratha%20spicy%20flatbread",
    isFeatured: false,
  },

  // ── Tandoori Snacks ────────────────────────────────────────────────────────
  {
    categoryId: "tandoori-snacks", displayOrder: 1,
    name: "Paneer Tikka", price: 200,
    description: "Marinated paneer cubes char-grilled in the tandoor — smoky and succulent.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20tikka%20tandoor%20grilled%20smoky%20marinated",
    isFeatured: true,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 2,
    name: "Paneer Malai", price: 220,
    description: "Tender paneer in a creamy malai marinade, gently grilled to perfection.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20malai%20tikka%20cream%20marinated%20grilled%20soft",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 3,
    name: "Mushroom Tikka", price: 180,
    description: "Juicy mushrooms marinated in spiced yoghurt and char-grilled in the tandoor.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20tikka%20tandoor%20grilled%20marinated%20yogurt",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 4,
    name: "Mushroom Malai Tikka", price: 200,
    description: "Mushrooms bathed in malai marinade and grilled for a rich, creamy bite.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20malai%20tikka%20cream%20rich%20grilled",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 5,
    name: "Snacks Champ (Dry)", price: 160,
    description: "Soya champ dry-grilled with bold spices — a protein-rich tandoori snack.",
    imageUrl: "https://source.unsplash.com/400x300/?soya%20champ%20grilled%20dry%20spiced%20tandoor",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 6,
    name: "Masala Champ", price: 180,
    description: "Soya champ coated in a vibrant masala marinade and charred to perfection.",
    imageUrl: "https://source.unsplash.com/400x300/?masala%20champ%20soya%20vibrant%20spiced%20grilled",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 7,
    name: "Malai Champ", price: 180,
    description: "Soya champ in a velvety cream and cheese marinade — melt-in-your-mouth good.",
    imageUrl: "https://source.unsplash.com/400x300/?malai%20champ%20cream%20cheese%20soya%20grilled%20soft",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 8,
    name: "Aachari Champ", price: 180,
    description: "Soya champ marinated in tangy pickle spices for a zingy tandoori experience.",
    imageUrl: "https://source.unsplash.com/400x300/?achari%20champ%20pickle%20spiced%20soya%20tandoor",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 9,
    name: "Kalimirch Champ", price: 120,
    description: "Soya champ grilled with freshly crushed black pepper — simple and punchy.",
    imageUrl: "https://source.unsplash.com/400x300/?black%20pepper%20champ%20soya%20grilled%20bold",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 10,
    name: "Afgani Champ", price: 190,
    description: "Soya champ in a rich Afghani cream marinade with cashew and cardamom notes.",
    imageUrl: "https://source.unsplash.com/400x300/?afghani%20champ%20cream%20cashew%20cardamom%20grilled",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 11,
    name: "Mint Haryali Champ", price: 180,
    description: "Soya champ in a fresh green mint-coriander marinade — light and herbaceous.",
    imageUrl: "https://source.unsplash.com/400x300/?haryali%20mint%20green%20coriander%20soya%20grilled",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 12,
    name: "Butter Masala Gravy Champ", price: 230,
    description: "Grilled soya champ served in a rich, buttery makhani gravy.",
    imageUrl: "https://source.unsplash.com/400x300/?butter%20masala%20gravy%20soya%20champ%20rich",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 13,
    name: "Delhi Spl. Champ", price: 210,
    description: "Our signature soya champ recipe — the house speciality you can't miss.",
    imageUrl: "https://source.unsplash.com/400x300/?delhi%20special%20soya%20champ%20signature%20house",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 14,
    name: "Delhi Spl. Gravy Champ", price: 230,
    description: "Delhi special champ served with a secret house gravy — utterly flavourful.",
    imageUrl: "https://source.unsplash.com/400x300/?delhi%20special%20champ%20secret%20gravy%20house",
    isFeatured: false,
  },
  {
    categoryId: "tandoori-snacks", displayOrder: 15,
    name: "White Gravy Champ", price: 230,
    description: "Soya champ in a creamy, mild white gravy — elegant and deeply satisfying.",
    imageUrl: "https://source.unsplash.com/400x300/?white%20gravy%20soya%20champ%20cream%20mild",
    isFeatured: false,
  },

  // ── Wraps (Kathi Roll) ────────────────────────────────────────────────────
  {
    categoryId: "wraps", displayOrder: 1,
    name: "Veg Wrap", price: 100,
    description: "Spiced vegetables rolled in a soft paratha with chutneys — great on the go.",
    imageUrl: "https://source.unsplash.com/400x300/?vegetable%20wrap%20kathi%20roll%20paratha%20spiced",
    isFeatured: false,
  },
  {
    categoryId: "wraps", displayOrder: 2,
    name: "Chilli Paneer Wrap", price: 140,
    description: "Spicy Indo-Chinese chilli paneer wrapped in a flaky paratha roll.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20paneer%20wrap%20spicy%20roll%20paratha",
    isFeatured: false,
  },
  {
    categoryId: "wraps", displayOrder: 3,
    name: "Paneer Tikka Wrap", price: 160,
    description: "Smoky tandoori paneer tikka wrapped with onion rings and mint chutney.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20tikka%20wrap%20kathi%20roll%20smoky%20mint",
    isFeatured: true,
  },

  // ── Burger ────────────────────────────────────────────────────────────────
  {
    categoryId: "burgers", displayOrder: 1,
    name: "Aloo Tikki Burger", price: 40,
    description: "Crispy spiced potato tikki in a soft bun with lettuce and chutney.",
    imageUrl: "https://source.unsplash.com/400x300/?aloo%20tikki%20burger%20potato%20patty%20indian%20bun",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 2,
    name: "Crispy Chatpta Burger", price: 50,
    description: "A bold, chatpata patty burger with tangy sauces and crunchy toppings.",
    imageUrl: "https://source.unsplash.com/400x300/?crispy%20chatpata%20burger%20tangy%20patty%20bun",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 3,
    name: "Veggie Burger", price: 60,
    description: "A wholesome veggie patty burger packed with fresh vegetables and sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?veggie%20burger%20fresh%20vegetable%20patty%20lettuce",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 4,
    name: "Noodle Burger", price: 60,
    description: "Fusion burger with a crispy noodle patty — an Indo-Chinese twist.",
    imageUrl: "https://source.unsplash.com/400x300/?noodle%20burger%20crispy%20indo%20chinese%20fusion",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 5,
    name: "Mexican Burger", price: 60,
    description: "Spicy Mexican-style burger with jalapeños, salsa, and crunchy slaw.",
    imageUrl: "https://source.unsplash.com/400x300/?mexican%20burger%20jalapeno%20salsa%20spicy%20bun",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 6,
    name: "Tandoori Burger", price: 60,
    description: "Smoky tandoori-marinated patty in a sesame bun — desi and delicious.",
    imageUrl: "https://source.unsplash.com/400x300/?tandoori%20burger%20smoky%20spiced%20sesame%20bun",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 7,
    name: "Cheese Slice Burger", price: 70,
    description: "Classic burger with a melted cheese slice — simple perfection.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20slice%20burger%20melted%20american%20classic",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 8,
    name: "Cheese Bust Burger", price: 70,
    description: "Cheese burst patty burger — every bite oozes with melted cheese.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20burst%20burger%20oozing%20melted%20inside",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 9,
    name: "Makhani Burger", price: 80,
    description: "Patty dipped in makhani sauce with a buttery brioche bun — rich and luxurious.",
    imageUrl: "https://source.unsplash.com/400x300/?makhani%20butter%20burger%20rich%20sauce%20brioche",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 10,
    name: "Spicy Garlic Burger", price: 80,
    description: "Bold garlic-spiced patty with fiery garlic mayo and crispy toppings.",
    imageUrl: "https://source.unsplash.com/400x300/?spicy%20garlic%20burger%20mayo%20bold%20crispy",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 11,
    name: "Maharaja Burger", price: 100,
    description: "Our towering royal burger — double patty, loaded toppings, and signature sauce.",
    imageUrl: "https://source.unsplash.com/400x300/?maharaja%20burger%20double%20patty%20loaded%20tall",
    isFeatured: true,
  },
  {
    categoryId: "burgers", displayOrder: 12,
    name: "French Fries Plain", price: 80,
    description: "Golden, crispy potato fries lightly salted — the perfect side.",
    imageUrl: "https://source.unsplash.com/400x300/?french%20fries%20golden%20crispy%20salted%20potato",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 13,
    name: "French Fries Peri-Peri", price: 100,
    description: "Crispy fries dusted in fiery peri-peri seasoning — hot and addictive.",
    imageUrl: "https://source.unsplash.com/400x300/?peri%20peri%20fries%20spicy%20seasoning%20crispy",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 14,
    name: "French Fries with Cheese", price: 120,
    description: "Hot fries drizzled with creamy cheese sauce — the ultimate guilty pleasure.",
    imageUrl: "https://source.unsplash.com/400x300/?cheese%20fries%20loaded%20sauce%20melted%20crispy",
    isFeatured: false,
  },
  {
    categoryId: "burgers", displayOrder: 15,
    name: "French Fries Smokey", price: 120,
    description: "Fries tossed in a smokey BBQ-style seasoning for a deep, bold flavour.",
    imageUrl: "https://source.unsplash.com/400x300/?smokey%20bbq%20fries%20seasoned%20crispy%20golden",
    isFeatured: false,
  },

  // ── Sandwich & Garlic Bread ────────────────────────────────────────────────
  {
    categoryId: "sandwiches", displayOrder: 1,
    name: "Veg Grilled Sandwich", price: 100,
    description: "Fresh vegetable grilled sandwich pressed to a golden, crispy finish.",
    imageUrl: "https://source.unsplash.com/400x300/?grilled%20vegetable%20sandwich%20pressed%20toasted",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 2,
    name: "Veg Corn Sandwich", price: 110,
    description: "Grilled sandwich filled with a creamy corn and vegetable mixture.",
    imageUrl: "https://source.unsplash.com/400x300/?corn%20vegetable%20sandwich%20grilled%20creamy",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 3,
    name: "Tandoori Sandwich", price: 120,
    description: "Sandwich with a smoky tandoori vegetable filling — a desi classic.",
    imageUrl: "https://source.unsplash.com/400x300/?tandoori%20vegetable%20sandwich%20smoky%20desi",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 4,
    name: "Mexican Sandwich", price: 120,
    description: "Zesty Mexican-spiced vegetable filling in a grilled sandwich with salsa.",
    imageUrl: "https://source.unsplash.com/400x300/?mexican%20sandwich%20salsa%20pepper%20zesty%20grilled",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 5,
    name: "Chilly Paneer Sandwich", price: 140,
    description: "Spicy chilli paneer stuffed in a grilled sandwich — bold and satisfying.",
    imageUrl: "https://source.unsplash.com/400x300/?chilli%20paneer%20sandwich%20grilled%20spicy",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 6,
    name: "Paneer Tikka Sandwich", price: 160,
    description: "Smoky paneer tikka in a grilled sandwich with mint chutney and onions.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20tikka%20sandwich%20grilled%20mint%20chutney",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 7,
    name: "Stuffed Garlic Bread", price: 140,
    description: "Toasted garlic bread stuffed with a cheesy vegetable filling — crowd favourite.",
    imageUrl: "https://source.unsplash.com/400x300/?stuffed%20garlic%20bread%20cheese%20vegetable%20toasted",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 8,
    name: "Stuffed Mushroom Garlic Bread", price: 160,
    description: "Garlicky bread stuffed with sautéed mushrooms and melted cheese.",
    imageUrl: "https://source.unsplash.com/400x300/?mushroom%20garlic%20bread%20stuffed%20cheese%20sauteed",
    isFeatured: false,
  },
  {
    categoryId: "sandwiches", displayOrder: 9,
    name: "Spicy Paneer Garlic Bread", price: 160,
    description: "Garlic bread topped with spicy paneer masala and gooey cheese — irresistible.",
    imageUrl: "https://source.unsplash.com/400x300/?paneer%20garlic%20bread%20spicy%20masala%20cheese",
    isFeatured: false,
  },

  // ── Momos ─────────────────────────────────────────────────────────────────
  {
    categoryId: "momos", displayOrder: 1,
    name: "Veg. Steam Momos", price: 80,
    description: "Delicate steamed dumplings filled with spiced vegetables — light and healthy.",
    imageUrl: "https://source.unsplash.com/400x300/?steamed%20veg%20momos%20dumplings%20healthy%20light",
    isFeatured: true,
  },
  {
    categoryId: "momos", displayOrder: 2,
    name: "Fried Momos", price: 90,
    description: "Crispy pan-fried momos with a crunchy shell and juicy veg filling inside.",
    imageUrl: "https://source.unsplash.com/400x300/?fried%20momos%20crispy%20golden%20dumplings",
    isFeatured: true,
  },
  {
    categoryId: "momos", displayOrder: 3,
    name: "Tandoori Momos", price: 110,
    description: "Steamed momos finished in the tandoor with a smoky spiced coating.",
    imageUrl: "https://source.unsplash.com/400x300/?tandoori%20momos%20grilled%20smoky%20spiced",
    isFeatured: true,
  },

  // ── Raita & Salad ─────────────────────────────────────────────────────────
  {
    categoryId: "raita-salad", displayOrder: 1,
    name: "Pineapple Raita", price: 110,
    description: "Chilled yoghurt with sweet pineapple chunks — a tropical, refreshing side.",
    imageUrl: "https://source.unsplash.com/400x300/?pineapple%20raita%20yogurt%20tropical%20sweet",
    isFeatured: false,
  },
  {
    categoryId: "raita-salad", displayOrder: 2,
    name: "Mix Veg Raita", price: 90,
    description: "Creamy yoghurt blended with fresh seasonal vegetables and mild spices.",
    imageUrl: "https://source.unsplash.com/400x300/?mix%20vegetable%20raita%20yogurt%20cooling%20indian",
    isFeatured: false,
  },
  {
    categoryId: "raita-salad", displayOrder: 3,
    name: "Boondi Raita", price: 90,
    description: "Classic yoghurt raita with crispy boondi pearls and roasted cumin.",
    imageUrl: "https://source.unsplash.com/400x300/?boondi%20raita%20crispy%20pearls%20yogurt%20cumin",
    isFeatured: false,
  },
  {
    categoryId: "raita-salad", displayOrder: 4,
    name: "Green Salad", price: 70,
    description: "A fresh garden salad with cucumber, tomato, onion, and a lemon dressing.",
    imageUrl: "https://source.unsplash.com/400x300/?green%20salad%20fresh%20cucumber%20tomato%20onion%20lemon",
    isFeatured: false,
  },
  {
    categoryId: "raita-salad", displayOrder: 5,
    name: "Papad", price: 15,
    description: "Crispy roasted papad — the classic accompaniment to any Indian meal.",
    imageUrl: "https://source.unsplash.com/400x300/?papad%20roasted%20crispy%20indian%20accompaniment",
    isFeatured: false,
  },

  // ── Mocktail ──────────────────────────────────────────────────────────────
  {
    categoryId: "mocktails", displayOrder: 1,
    name: "Fresh Lime Soda", price: 60,
    description: "Sparkling soda with fresh lime juice — sweet, salty, or plain, your choice.",
    imageUrl: "https://source.unsplash.com/400x300/?fresh%20lime%20soda%20sparkling%20citrus%20drink",
    isFeatured: true,
  },
  {
    categoryId: "mocktails", displayOrder: 2,
    name: "Mojito (Mocktail)", price: 80,
    description: "Classic mint-lime mocktail with a burst of freshness in every sip.",
    imageUrl: "https://source.unsplash.com/400x300/?mojito%20mocktail%20mint%20lime%20sparkling%20fresh",
    isFeatured: true,
  },
  {
    categoryId: "mocktails", displayOrder: 3,
    name: "Black Current Mojito", price: 100,
    description: "Refreshing mojito with a bold blackcurrant twist — vibrant and berry-rich.",
    imageUrl: "https://source.unsplash.com/400x300/?blackcurrant%20mojito%20purple%20berry%20mocktail",
    isFeatured: true,
  },
  {
    categoryId: "mocktails", displayOrder: 4,
    name: "Peach Mojito", price: 120,
    description: "Mellow peach-flavoured mojito — fruity, aromatic, and utterly refreshing.",
    imageUrl: "https://source.unsplash.com/400x300/?peach%20mojito%20fruity%20aromatic%20mocktail",
    isFeatured: false,
  },
  {
    categoryId: "mocktails", displayOrder: 5,
    name: "Blue Sky (Mocktail)", price: 80,
    description: "A vivid blue mocktail with citrus and tropical notes — as refreshing as a clear sky.",
    imageUrl: "https://source.unsplash.com/400x300/?blue%20mocktail%20tropical%20citrus%20vivid%20drink",
    isFeatured: false,
  },
  {
    categoryId: "mocktails", displayOrder: 6,
    name: "Jungle Bird (Mocktail)", price: 120,
    description: "Exotic tropical fruit mocktail inspired by lush jungle freshness.",
    imageUrl: "https://source.unsplash.com/400x300/?jungle%20bird%20tropical%20fruit%20mocktail%20exotic",
    isFeatured: false,
  },
  {
    categoryId: "mocktails", displayOrder: 7,
    name: "Sunsets (Mocktail)", price: 120,
    description: "A gorgeous sunset-hued blend of orange and berry — visually stunning and delicious.",
    imageUrl: "https://source.unsplash.com/400x300/?sunset%20mocktail%20orange%20berry%20gradient%20drink",
    isFeatured: false,
  },
  {
    categoryId: "mocktails", displayOrder: 8,
    name: "Thai Beach (Mocktail)", price: 120,
    description: "Tropical coconut and lychee mocktail that transports you to a Thai beach.",
    imageUrl: "https://source.unsplash.com/400x300/?thai%20beach%20coconut%20lychee%20tropical%20mocktail",
    isFeatured: false,
  },

  // ── Hot Coffee & Beverages ─────────────────────────────────────────────────
  {
    categoryId: "hot-beverages", displayOrder: 1,
    name: "Cappuccino", price: 70,
    description: "Espresso topped with velvety steamed milk foam — the Italian coffee classic.",
    imageUrl: "https://source.unsplash.com/400x300/?cappuccino%20espresso%20milk%20foam%20coffee%20latte%20art",
    isFeatured: false,
  },
  {
    categoryId: "hot-beverages", displayOrder: 2,
    name: "Americano", price: 70,
    description: "Smooth, bold espresso diluted with hot water for a clean, strong coffee.",
    imageUrl: "https://source.unsplash.com/400x300/?americano%20black%20coffee%20bold%20espresso",
    isFeatured: false,
  },
  {
    categoryId: "hot-beverages", displayOrder: 3,
    name: "Green Tea", price: 50,
    description: "Light and antioxidant-rich green tea — a healthy, soothing sip.",
    imageUrl: "https://source.unsplash.com/400x300/?green%20tea%20cup%20healthy%20antioxidant",
    isFeatured: false,
  },
  {
    categoryId: "hot-beverages", displayOrder: 4,
    name: "Masala Tea", price: 50,
    description: "Aromatic Indian chai brewed with ginger, cardamom, and warming spices.",
    imageUrl: "https://source.unsplash.com/400x300/?masala%20chai%20indian%20spiced%20tea%20ginger%20cardamom",
    isFeatured: false,
  },
  {
    categoryId: "hot-beverages", displayOrder: 5,
    name: "Packed Water", price: 20,
    description: "Chilled packaged drinking water — a cool and refreshing essential.",
    imageUrl: "https://source.unsplash.com/400x300/?mineral%20water%20bottle%20refreshing",
    isFeatured: false,
  },
  {
    categoryId: "hot-beverages", displayOrder: 6,
    name: "Soft Drink", price: 20,
    description: "Chilled carbonated soft drink — pick your favourite brand.",
    imageUrl: "https://source.unsplash.com/400x300/?soft%20drink%20carbonated%20cola%20chilled",
    isFeatured: false,
  },

  // ── Ice Cream & Shakes ─────────────────────────────────────────────────────
  {
    categoryId: "ice-cream-shakes", displayOrder: 1,
    name: "Ice Cream (Regular)", price: 70,
    description: "A scoop of creamy classic ice cream — the perfect sweet finish.",
    imageUrl: "https://source.unsplash.com/400x300/?ice%20cream%20scoop%20vanilla%20creamy%20dessert",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 2,
    name: "Ice Cream (Premium)", price: 80,
    description: "Premium-quality ice cream scoop with a richer, creamier texture.",
    imageUrl: "https://source.unsplash.com/400x300/?premium%20ice%20cream%20scoop%20rich%20creamy%20waffle%20cone",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 3,
    name: "Cold Coffee", price: 110,
    description: "Chilled blended coffee with milk and sugar — cool, rich, and energising.",
    imageUrl: "https://source.unsplash.com/400x300/?cold%20coffee%20blended%20iced%20milk%20chilled",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 4,
    name: "Vanilla Shakes", price: 110,
    description: "Thick, creamy vanilla milkshake made with real ice cream.",
    imageUrl: "https://source.unsplash.com/400x300/?vanilla%20milkshake%20thick%20creamy%20smooth%20white",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 5,
    name: "Strawberry Shakes", price: 110,
    description: "Sweet and tangy strawberry milkshake blended to a smooth, velvety finish.",
    imageUrl: "https://source.unsplash.com/400x300/?strawberry%20milkshake%20pink%20thick%20fruity",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 6,
    name: "Mango Shakes", price: 110,
    description: "Thick Alphonso mango milkshake — tropical, rich, and absolutely irresistible.",
    imageUrl: "https://source.unsplash.com/400x300/?mango%20milkshake%20thick%20yellow%20tropical",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 7,
    name: "Black Current Shakes", price: 110,
    description: "Bold blackcurrant milkshake — deep berry flavour in a thick, cold shake.",
    imageUrl: "https://source.unsplash.com/400x300/?blackcurrant%20milkshake%20purple%20berry%20thick",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 8,
    name: "Chocolate Shakes", price: 110,
    description: "Rich chocolate milkshake made with premium cocoa — a chocoholic's dream.",
    imageUrl: "https://source.unsplash.com/400x300/?chocolate%20milkshake%20dark%20cocoa%20thick%20creamy",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 9,
    name: "Orio Shakes", price: 110,
    description: "Creamy Oreo cookie milkshake blended into a thick, indulgent treat.",
    imageUrl: "https://source.unsplash.com/400x300/?oreo%20milkshake%20cookie%20cream%20thick",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 10,
    name: "Kitkat Shakes", price: 110,
    description: "KitKat chocolate-wafer milkshake — crunchy bits in every creamy sip.",
    imageUrl: "https://source.unsplash.com/400x300/?kitkat%20chocolate%20wafer%20milkshake",
    isFeatured: false,
  },
  {
    categoryId: "ice-cream-shakes", displayOrder: 11,
    name: "Butter Scotch Shakes", price: 110,
    description: "Smooth butterscotch milkshake with caramel notes — sweet and deeply satisfying.",
    imageUrl: "https://source.unsplash.com/400x300/?butterscotch%20milkshake%20caramel%20golden%20thick",
    isFeatured: false,
  },
];

// ── CLEAR COLLECTIONS ─────────────────────────────────────────────────────────
async function clearCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) return;

  // Delete in batches of 400
  const chunks = [];
  for (let i = 0; i < snapshot.docs.length; i += 400) {
    chunks.push(snapshot.docs.slice(i, i + 400));
  }
  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  console.log(`🗑️  Cleared ${snapshot.size} docs from '${collectionName}'`);
}

// ── SEED MENU ─────────────────────────────────────────────────────────────────
async function seedMenu() {
  // Clear existing data first
  await clearCollection("categories");
  await clearCollection("menuItems");

  // Seed categories
  const catBatch = db.batch();
  for (const cat of CATEGORIES) {
    const ref = db.collection("categories").doc(cat.id);
    catBatch.set(ref, { ...cat, isActive: true });
  }
  await catBatch.commit();
  console.log(`✅ Seeded ${CATEGORIES.length} categories`);

  // Seed menu items in batches of 400
  let itemCount = 0;
  let batch = db.batch();

  for (const item of MENU_ITEMS) {
    const ref = db.collection("menuItems").doc();
    batch.set(ref, {
      categoryId:   item.categoryId,
      name:         item.name,
      price:        item.price,
      description:  item.description,
      imageUrl:     item.imageUrl,
      displayOrder: item.displayOrder,
      isVeg:        true,
      isAvailable:  true,
      isFeatured:   item.isFeatured,
    });
    itemCount++;

    if (itemCount % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }

  // Commit any remaining items
  if (itemCount % 400 !== 0) {
    await batch.commit();
  }

  console.log(`✅ Seeded ${itemCount} menu items`);
}

// ── RUN ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log("🔥 Starting Firebase seed...\n");
  await createAdmin();
  await seedSettings();
  await seedMenu();
  console.log("\n🎉 Done! Your Firebase backend is ready.");
  console.log("\n📋 Admin login:");
  console.log("   Email:    admin@delhifoodjunction.com");
  console.log("   Password: Admin@123");
  console.log(`\n📊 Total items seeded: ${MENU_ITEMS.length} across ${CATEGORIES.length} categories`);
  process.exit(0);
})();
