// client/src/app/services/api/wishlist.ts

import axiosInstance from "./axios";
import { Product } from "./products";

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

const wishlistService = {
  // دریافت علاقه‌مندی‌ها
  getWishlist: async (): Promise<Wishlist> => {
    const response = await axiosInstance.get("/wishlist");
    return response.data.data.wishlist;
  },

  // افزودن به علاقه‌مندی‌ها
  addToWishlist: async (productId: string): Promise<Wishlist> => {
    const response = await axiosInstance.post("/wishlist", { productId });
    return response.data.data.wishlist;
  },

  // حذف از علاقه‌مندی‌ها
  removeFromWishlist: async (productId: string): Promise<Wishlist> => {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response.data.data.wishlist;
  },

  // پاک کردن همه علاقه‌مندی‌ها
  clearWishlist: async (): Promise<void> => {
    await axiosInstance.delete("/wishlist");
  },

  // انتقال به سبد خرید
  moveToCart: async (productId: string): Promise<{ productId: string }> => {
    const response = await axiosInstance.post("/wishlist/move-to-cart", {
      productId,
    });
    return response.data.data;
  },
};

export default wishlistService;
