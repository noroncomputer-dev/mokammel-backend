import express from "express";
import {
  getActiveSlides,
  getAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
} from "../controllers/slider.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

// مسیرهای عمومی (فرانت‌اند)
router.get("/active", getActiveSlides);

// مسیرهای ادمین
router.get("/", protect, adminOnly, getAllSlides);
router.post("/", protect, adminOnly, createSlide);
router.put("/:id", protect, adminOnly, updateSlide);
router.delete("/:id", protect, adminOnly, deleteSlide);

export default router;
