import { adminDb } from "@/lib/firebase-admin";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  displayOrder: number;
  isActive: boolean;
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
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

export async function getMenuCategories(): Promise<Category[]> {
  // Sort in-memory to avoid needing a composite Firestore index
  const snap = await adminDb
    .collection("categories")
    .where("isActive", "==", true)
    .get();
  const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  return cats.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export async function getMenuWithItems(): Promise<CategoryWithItems[]> {
  const categories = await getMenuCategories();
  const result: CategoryWithItems[] = [];

  for (const cat of categories) {
    const itemsSnap = await adminDb
      .collection("menuItems")
      .where("categoryId", "==", cat.id)
      .where("isAvailable", "==", true)
      .get();
    const items = itemsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as MenuItem))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    result.push({ ...cat, items });
  }
  return result;
}
