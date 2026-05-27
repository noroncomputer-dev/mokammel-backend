// client/src/app/store/index.ts

export { useAuthStore } from "./auth.store";
export { useCartStore } from "./cart.store";
export { useWishlistStore } from "./wishlist.store";
export { useCompareStore } from "./compare.store";
export { useThemeStore, initializeTheme } from "./theme.store";

// export types
export type { CartItem } from "./cart.store";
export type { WishlistItem } from "./wishlist.store";
export type { CompareProduct } from "./compare.store";
export type { Theme } from "./theme.store";
