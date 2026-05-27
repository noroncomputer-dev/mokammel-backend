// client/src/app/store/wishlist.store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import wishlistService from "../services/api/wishlist";
import type { Product } from "../services/api/products";

// ✅ تایپ برای آیتم علاقه‌مندی از سمت سرور
interface ServerWishlistItem {
  product: Product;
  addedAt: string;
}

// ✅ تایپ برای پاسخ سرور
interface ServerWishlistResponse {
  _id: string;
  user: string;
  items: ServerWishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  isSynced: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (item: WishlistItem) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  syncWithServer: () => Promise<void>;
  clearWishlist: () => void;
}

// ✅ تابع کمکی برای تبدیل داده سرور به داده store
const mapServerItemToWishlistItem = (
  item: ServerWishlistItem,
): WishlistItem => {
  const product = item.product;
  return {
    productId: product._id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    image: product.images?.[0] || "/placeholder.jpg",
    slug: product.slug,
  };
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSynced: false,

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const wishlist =
            (await wishlistService.getWishlist()) as unknown as ServerWishlistResponse;
          const items = (wishlist.items || []).map(mapServerItemToWishlistItem);
          set({ items, isLoading: false, isSynced: true });
        } catch (error) {
          console.error("Error fetching wishlist:", error);
          set({ isLoading: false });
        }
      },

      addItem: async (item) => {
        try {
          await wishlistService.addToWishlist(item.productId);
          const { items } = get();

          if (!items.some((i) => i.productId === item.productId)) {
            set({ items: [...items, item] });
          }
          return true;
        } catch (error) {
          console.error("Error adding to wishlist:", error);
          return false;
        }
      },

      removeItem: async (productId) => {
        try {
          await wishlistService.removeFromWishlist(productId);
          const { items } = get();
          set({
            items: items.filter((i) => i.productId !== productId),
          });
          return true;
        } catch (error) {
          console.error("Error removing from wishlist:", error);
          return false;
        }
      },

      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((i) => i.productId === productId);
      },

      syncWithServer: async () => {
        await get().fetchWishlist();
      },

      clearWishlist: () => {
        set({ items: [], isSynced: false });
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        isSynced: state.isSynced,
      }),
    },
  ),
);
