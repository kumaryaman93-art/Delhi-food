import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
  tableNumber: string;
  deliveryAddress: string;
  specialInstructions: string;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setOrderType: (type: "DINE_IN" | "TAKEAWAY" | "DELIVERY") => void;
  setTableNumber: (n: string) => void;
  setDeliveryAddress: (a: string) => void;
  setSpecialInstructions: (s: string) => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "DINE_IN",
      tableNumber: "",
      deliveryAddress: "",
      specialInstructions: "",

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], tableNumber: "", deliveryAddress: "", specialInstructions: "" }),

      setOrderType: (type) => set({ orderType: type }),
      setTableNumber: (n) => set({ tableNumber: n }),
      setDeliveryAddress: (a) => set({ deliveryAddress: a }),
      setSpecialInstructions: (s) => set({ specialInstructions: s }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "dfj-cart" }
  )
);
