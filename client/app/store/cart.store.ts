import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  slug?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image: string;
  flavor?: string;
  weight?: string;
}

interface CartStore {
  items: CartItem[];
  coupon: { code: string; amount: number } | null;

  // عملیات اصلی
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, flavor?: string, weight?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    flavor?: string,
    weight?: string,
  ) => void;
  clearCart: () => void;

  // محاسبات
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getTotalItems: () => number;

  // کد تخفیف
  applyCoupon: (code: string, amount: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) =>
            i.productId === item.productId &&
            i.flavor === item.flavor &&
            i.weight === item.weight,
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += item.quantity;
          set({ items: newItems });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId, flavor, weight) => {
        const { items } = get();
        set({
          items: items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.flavor === flavor &&
                i.weight === weight
              ),
          ),
        });
      },

      updateQuantity: (productId, quantity, flavor, weight) => {
        const { items } = get();
        const index = items.findIndex(
          (i) =>
            i.productId === productId &&
            i.flavor === flavor &&
            i.weight === weight,
        );
        if (index >= 0 && quantity >= 1) {
          const newItems = [...items];
          newItems[index].quantity = quantity;
          set({ items: newItems });
        }
      },

      clearCart: () => set({ items: [], coupon: null }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.discountPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const { coupon, getSubtotal } = get();
        if (!coupon) return 0;
        const subtotal = getSubtotal();
        return Math.min(coupon.amount, subtotal);
      },

      getTotal: () => {
        const { getSubtotal, getDiscount } = get();
        return getSubtotal() - getDiscount();
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      applyCoupon: (code, amount) => set({ coupon: { code, amount } }),

      removeCoupon: () => set({ coupon: null }),
    }),
    { name: "cart-storage" },
  ),
);
