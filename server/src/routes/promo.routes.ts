// backend/src/routes/promo.routes.ts
import express from "express";
import {
  getActivePromos,
  getAllPromos,
  createPromo,
  updatePromo,
  deletePromo,
  deleteManyPromos,
} from "../controllers/promo.controller";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// ==================== مسیرهای عمومی ====================
router.get("/active", getActivePromos);

// ==================== مسیرهای ادمین ====================
router.get("/", protect, admin, getAllPromos);
router.post("/", protect, admin, createPromo);
router.put("/:id", protect, admin, updatePromo);
router.delete("/:id", protect, admin, deletePromo);
router.post("/delete-many", protect, admin, deleteManyPromos);

export default router;
