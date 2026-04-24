import MenuPageClient from "@/components/customer/menu-page";
import { getMenuWithItems } from "@/lib/firestore/menu";

export default async function MenuPage() {
  const categories = await getMenuWithItems();
  return <MenuPageClient categories={categories} />;
}
