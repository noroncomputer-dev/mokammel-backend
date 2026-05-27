// backend/src/routes/brand.routes.ts
import express from "express";
import {
  getBrands,
  getAllBrands,
  getActiveBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  permanentDeleteBrand,
} from "../controllers/brand.controller";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// مسیرهای عمومی
router.get("/", getBrands);
router.get("/all", getAllBrands);
router.get("/active", getActiveBrands);
router.get("/:id", getBrandById);
router.get("/slug/:slug", getBrandBySlug);

// مسیرهای ادمین
router.post("/", protect, admin, createBrand);
router.put("/:id", protect, admin, updateBrand);
router.delete("/:id", protect, admin, deleteBrand);
router.delete("/:id/permanent", protect, admin, permanentDeleteBrand);

export default router;
