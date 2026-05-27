import express from "express";
import {
  getAnalytics,
  getDashboardStats,
  getTopProducts,
  getDailySales,
} from "../controllers/analytics.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

// همه مسیرها نیاز به احراز هویت و دسترسی ادمین دارند
router.use(protect, adminOnly);

router.get("/", getAnalytics);
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/top-products", getTopProducts);
router.get("/daily-sales", getDailySales);

export default router;
