import express from "express";
import {
  uploadImage,
  deleteImage,
  uploadAvatar,
  deleteAvatar,
} from "../controllers/upload.controller";
import {
  uploadProductImage,
  uploadAvatarImage,
} from "../middleware/upload.middleware";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// آپلود تصویر محصول (ادمین)
router.post("/", protect, uploadProductImage, uploadImage);
router.delete("/:publicId", protect, deleteImage);

// آپلود آواتار (کاربر عادی)
router.post("/avatar", protect, uploadAvatarImage, uploadAvatar);
router.delete("/avatar/:publicId", protect, deleteAvatar);

export default router;
