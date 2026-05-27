import { Router } from "express";
import {
  getMyNotifications,
  getLatestAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// کاربر عادی
router.get("/", protect, getMyNotifications);
router.put("/:notificationId/read", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);
router.delete("/:notificationId", protect, deleteNotification);

// ادمین
router.get("/admin/latest", protect, adminOnly, getLatestAdminNotifications);
export default router;
