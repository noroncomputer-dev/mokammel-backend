import { Router } from "express";
import {
  applyCoupon,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// روت عمومی (فقط کاربر عادی)
router.post("/apply", protect, applyCoupon);

// روت‌های ادمین
router.get("/", protect, adminOnly, getAllCoupons);
router.get("/:id", protect, adminOnly, getCouponById);
router.post("/", protect, adminOnly, createCoupon);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;
