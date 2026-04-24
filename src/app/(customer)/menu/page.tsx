export const dynamic = "force-dynamic";

import MenuPageClient from "@/components/customer/menu-page";
import { getMenuWithItems } from "@/lib/firestore/menu";

export default async function MenuPage() {
  // Graceful fallback — shows empty menu shell instead of crashing
  let categories: Awaited<ReturnType<typeof getMenuWithItems>> = [];
  try {
    categories = await getMenuWithItems();
  } catch (err) {
    console.error("[MenuPage] Failed to load menu:", err);
  }
  return <MenuPageClient categories={categories} />;
}
