// server/src/routes/wishlist.routes.ts

import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
} from "../controllers/wishlist.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// همه روت‌ها نیاز به احراز هویت دارند
router.use(protect);

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.delete("/", clearWishlist);
router.post("/move-to-cart", moveToCart);

export default router;
