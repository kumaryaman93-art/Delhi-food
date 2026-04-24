import { adminDb } from "@/lib/firebase-admin";
import { unstable_cache } from "next/cache";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  isNew?: boolean;
  displayOrder: number;
  variants?: MenuVariant[];
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

// ─── Raw fetchers (called by the cached wrappers below) ───────────────────────

async function _getMenuCategories(): Promise<Category[]> {
  const snap = await adminDb
    .collection("categories")
    .where("isActive", "==", true)
    .get();
  const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  return cats.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

async function _getMenuWithItems(): Promise<CategoryWithItems[]> {
  // ── 2 parallel queries instead of 1 + N sequential ────────────────────────
  // Before: 1 categories query + 1 query PER category = 21 round-trips (slow!)
  // After:  fetch ALL categories + ALL items in parallel = 2 round-trips (fast!)
  const [categoriesSnap, itemsSnap] = await Promise.all([
    adminDb.collection("categories").where("isActive", "==", true).get(),
    adminDb.collection("menuItems").where("isAvailable", "==", true).get(),
  ]);

  const categories = categoriesSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Category))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  // Group all items by categoryId in memory
  const byCategory: Record<string, MenuItem[]> = {};
  for (const doc of itemsSnap.docs) {
    const item = { id: doc.id, ...doc.data() } as MenuItem;
    if (!byCategory[item.categoryId]) byCategory[item.categoryId] = [];
    byCategory[item.categoryId].push(item);
  }

  // Sort each category's items by displayOrder
  for (const arr of Object.values(byCategory)) {
    arr.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  return categories.map((cat) => ({
    ...cat,
    items: byCategory[cat.id] ?? [],
  }));
}

// ─── Cached exports ────────────────────────────────────────────────────────────
// Results are cached for 5 minutes (300s). Subsequent requests within the TTL
// are served instantly from the Next.js data cache — no Firestore round-trip.
// Cache is invalidated automatically on the next request after TTL expires.

export const getMenuCategories = unstable_cache(
  _getMenuCategories,
  ["menu-categories"],
  { revalidate: 300 }
);

export const getMenuWithItems = unstable_cache(
  _getMenuWithItems,
  ["menu-with-items"],
  { revalidate: 300 }
);
