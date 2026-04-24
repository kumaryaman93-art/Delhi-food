import { adminDb } from "@/lib/firebase-admin";

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  about: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  gstRate: number;
  packagingFee: number;
  defaultEta: number;
  dineInEnabled: boolean;
  takeawayEnabled: boolean;
  deliveryEnabled: boolean;
  codEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "Delhi Food Junction",
  tagline: "100% Pure Vegetarian",
  about: "Best Continental Restaurant in Ludhiana Punjab India",
  phone: "099147 55509",
  address: "Netaji Nagar, Netaji Colony, Salem Tabri, Ludhiana, Punjab 141008",
  logoUrl: null,
  heroImageUrl: null,
  gstRate: 5,
  packagingFee: 20,
  defaultEta: 20,
  dineInEnabled: true,
  takeawayEnabled: true,
  deliveryEnabled: false,
  codEnabled: false,
  soundEnabled: true,
};

export async function getSettings(): Promise<RestaurantSettings> {
  try {
    const doc = await adminDb.collection("settings").doc("restaurant").get();
    if (doc.exists) return doc.data() as RestaurantSettings;
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function updateSettings(data: Partial<RestaurantSettings>) {
  await adminDb.collection("settings").doc("restaurant").set(data, { merge: true });
}
