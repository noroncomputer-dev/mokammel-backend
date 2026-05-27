import express from "express";
import {
  getProductReviews,
  likeReview,
  getAllReviews,
  approveReview,
  deleteReview,
  adminReplyToReview,
  createOrUpdateReview,
} from "../controllers/review.controller";
import { protect, adminOnly, admin } from "../middleware/auth.middleware";

const router = express.Router();

// مسیرهای عمومی
router.get("/product/:productId", getProductReviews);

// مسیرهای محافظت شده (فقط کاربران لاگین شده)
router.post("/:reviewId/like", protect, likeReview);

// مسیرهای ادمین
router.get("/admin/all", protect, adminOnly, getAllReviews);
router.put("/:reviewId/approve", protect, adminOnly, approveReview);
router.post("/:reviewId/reply", protect, adminOnly, adminReplyToReview);
router.delete("/:reviewId", protect, adminOnly, deleteReview);
router.post("/", protect, createOrUpdateReview);
router.put("/:reviewId/approve", protect, adminOnly, approveReview);

// مسیرهای عمومی (نیاز به احراز هویت)
router.post("/", protect, createOrUpdateReview);
router.post("/:reviewId/like", protect, likeReview);

// مسیرهای ادمین (فقط برای حذف و مشاهده همه)
router.get("/admin/all", protect, adminOnly, getAllReviews);
router.delete("/:reviewId", protect, adminOnly, deleteReview);
router.post("/:reviewId/reply", protect, adminOnly, adminReplyToReview);

// تأیید خودکار شد، پس نیازی به این مسیر نیست
// router.put("/:reviewId/approve", protect, admin, approveReview);
export default router;
