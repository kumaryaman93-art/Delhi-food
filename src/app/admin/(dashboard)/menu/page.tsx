import AdminMenuClient from "@/components/admin/menu-manager";
import { adminDb } from "@/lib/firebase-admin";

export const revalidate = 0;

export default async function AdminMenuPage() {
  const [catSnap, itemsSnap] = await Promise.all([
    adminDb.collection("categories").orderBy("displayOrder").get(),
    adminDb.collection("menuItems").orderBy("displayOrder").get(),
  ]);

  const categories = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const items = itemsSnap.docs.map((d) => {
    const data = d.data();
    const cat = categories.find((c) => c.id === data.categoryId);
    return {
      id: d.id,
      ...data,
      price: Number(data.price),
      category: cat ? { name: (cat as unknown as { name: string }).name, emoji: (cat as unknown as { emoji: string }).emoji } : { name: "", emoji: "" },
    };
  });

  return <AdminMenuClient categories={categories as never} items={items as never} />;
}
