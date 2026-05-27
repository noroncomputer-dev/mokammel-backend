import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getUserStats,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile, // ✅ اضافه کن
  updateAvatar, // ✅ اضافه کن
} from "../controllers/user.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = express.Router();

// ==================== مسیرهای کاربر جاری ====================
router.get("/stats", protect, getUserStats);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

// ✅ مسیرهای پروفایل
router.put("/profile", protect, updateProfile); // بروزرسانی اطلاعات کاربر
router.put("/avatar", protect, updateAvatar); // بروزرسانی آواتار

// ==================== مسیرهای آدرس ====================
router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.put("/addresses/:addressId/default", protect, setDefaultAddress);

// ==================== مسیرهای ادمین ====================
router
  .route("/")
  .get(protect, adminOnly, getAllUsers)
  .post(protect, adminOnly, createUser);

router
  .route("/:id")
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

export default router;
