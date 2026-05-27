// client/src/app/store/compare.store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import compareService from "../services/api/compare";
import type { Product } from "../services/api/products";

// ✅ تایپ برای آیتم مقایسه از سمت سرور
interface ServerCompareItem {
  product: Product;
  addedAt: string;
}

// ✅ تایپ برای پاسخ سرور
interface ServerCompareResponse {
  _id: string;
  user: string;
  items: ServerCompareItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CompareProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  stock: number;
}

interface CompareState {
  items: CompareProduct[];
  maxItems: number;
  isLoading: boolean;
  fetchCompare: () => Promise<void>;
  addItem: (product: CompareProduct) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  isInCompare: (productId: string) => boolean;
  canAddMore: () => boolean;
  clearCompare: () => Promise<void>;
}

// ✅ تابع کمکی برای تبدیل داده سرور به داده store
const mapServerItemToCompareProduct = (
  item: ServerCompareItem,
): CompareProduct => {
  const product = item.product;
  return {
    id: product._id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    image: product.images?.[0] || "/placeholder.jpg",
    rating: product.rating,
    stock: product.stock,
  };
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,
      isLoading: false,

      fetchCompare: async () => {
        set({ isLoading: true });
        try {
          const compare =
            (await compareService.getCompareList()) as unknown as ServerCompareResponse;
          const items = (compare.items || []).map(
            mapServerItemToCompareProduct,
          );
          set({ items, isLoading: false });
        } catch (error) {
          console.error("Error fetching compare list:", error);
          set({ isLoading: false });
        }
      },

      addItem: async (product) => {
        const { items, maxItems } = get();

        if (items.length >= maxItems) {
          console.warn(`حداکثر ${maxItems} محصول قابل مقایسه است`);
          return false;
        }

        if (items.some((i) => i.id === product.id)) {
          return false;
        }

        try {
          await compareService.addToCompare(product.id);
          set({ items: [...items, product] });
          return true;
        } catch (error) {
          console.error("Error adding to compare:", error);
          return false;
        }
      },

      removeItem: async (productId) => {
        try {
          await compareService.removeFromCompare(productId);
          const { items } = get();
          set({ items: items.filter((i) => i.id !== productId) });
          return true;
        } catch (error) {
          console.error("Error removing from compare:", error);
          return false;
        }
      },

      isInCompare: (productId) => {
        const { items } = get();
        return items.some((i) => i.id === productId);
      },

      canAddMore: () => {
        const { items, maxItems } = get();
        return items.length < maxItems;
      },

      clearCompare: async () => {
        try {
          await compareService.clearCompare();
          set({ items: [] });
        } catch (error) {
          console.error("Error clearing compare:", error);
        }
      },
    }),
    {
      name: "compare-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
