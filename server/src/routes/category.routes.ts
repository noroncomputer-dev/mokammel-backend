// backend/src/routes/category.routes.ts
import express from "express";
import {
  getCategories,
  getActiveCategories, // ✅ اضافه کن
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// مسیرهای عمومی
router.get("/", getCategories);
router.get("/active", getActiveCategories); // ✅ اضافه کن

// مسیرهای ادمین
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

export default router;
