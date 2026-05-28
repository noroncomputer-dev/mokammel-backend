import express from "express";
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getBestSellerProducts,
  getOnSaleProducts,
  getFilterOptions,
  advancedSearch,
  updateProductStock,
  permanentDeleteProduct,
} from "../controllers/product.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

// ─── روت‌های خاص (باید قبل از /:slug باشند) ──────────────
router.get("/featured", getFeaturedProducts); // ✅ این باید قبل از /:slug باشد
router.get("/best-sellers", getBestSellerProducts);
router.get("/on-sale", getOnSaleProducts);
router.get("/filters/options", getFilterOptions);
router.get("/id/:id", getProductById);

router.post("/search", advancedSearch);

// ─── روت‌های عمومی ────────────────────────────────────────
router.get("/", getProducts);

// ─── این باید مطلقاً آخرین GET باشد ──────────────────────
router.get("/:slug", getProductBySlug);

// ─── روت‌های ادمین ────────────────────────────────────────
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.patch("/:id/stock", protect, adminOnly, updateProductStock);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.delete("/:id/permanent", protect, adminOnly, permanentDeleteProduct);

export default router;
