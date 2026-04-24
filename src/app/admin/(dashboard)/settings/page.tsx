import AdminSettingsClient from "@/components/admin/settings-form";
import { getSettings } from "@/lib/firestore/settings";

export const revalidate = 0;

export default async function SettingsPage() {
  const settings = await getSettings();
  return <AdminSettingsClient settings={settings} />;
}
