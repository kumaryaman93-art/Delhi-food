export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  isVeg: boolean;
}

export interface MenuItemType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  isNew: boolean;
  displayOrder: number;
  category: {
    id: string;
    name: string;
    emoji: string | null;
  };
}

export interface OrderType2 {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: string;
  tableNumber: string | null;
  deliveryAddress: string | null;
  subtotal: number;
  tax: number;
  packagingFee: number;
  total: number;
  specialInstructions: string | null;
  etaMinutes: number | null;
  etaSetAt: string | null;
  createdAt: string;
  confirmedAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  payment: {
    status: PaymentStatus;
    method: string | null;
    paidAt: string | null;
  } | null;
}
