import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Notification from "../models/notification.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== تابع داخلی برای ایجاد اعلان ====================
export const createNotification = async (
  userId: string,
  type: "order" | "review" | "system" | "promotion" | "payment",
  title: string,
  message: string,
  link?: string,
) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// ==================== اعلان برای ادمین ====================
export const createAdminNotification = async (
  title: string,
  message: string,
  type: "order" | "review" | "system" | "promotion" | "payment" = "system",
) => {
  try {
    const admins = await import("../models/user.model").then((m) =>
      m.default.find({ role: { $in: ["admin", "super_admin"] } }),
    );
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type,
        title,
        message,
        link: "/admin/orders",
      });
    }
  } catch (error) {
    console.error("Error creating admin notification:", error);
  }
};

// ==================== اعلان ثبت سفارش برای کاربر ====================
export const notifyOrderCreated = async (
  userId: string,
  orderId: string,
  orderNumber: string,
) => {
  await createNotification(
    userId,
    "order",
    "سفارش شما ثبت شد",
    `سفارش شماره ${orderNumber} با موفقیت ثبت شد. وضعیت سفارش را پیگیری کنید.`,
    `/profile/orders/${orderId}`,
  );
};

// ==================== اعلان تغییر وضعیت سفارش ====================
export const notifyOrderStatusChanged = async (
  userId: string,
  orderId: string,
  orderNumber: string,
  status: string,
) => {
  const statusMessages: Record<string, string> = {
    processing: "در حال پردازش",
    shipped: "ارسال شد",
    delivered: "تحویل داده شد",
    cancelled: "لغو شد",
  };

  const statusText = statusMessages[status] || status;
  await createNotification(
    userId,
    "order",
    `وضعیت سفارش ${orderNumber}`,
    `وضعیت سفارش شما به "${statusText}" تغییر کرد.`,
    `/profile/orders/${orderId}`,
  );
};

// ==================== دریافت اعلان‌های کاربر جاری ====================
export const getUserNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments({ user: userId }),
    ]);

    res.json(
      apiResponse(true, "اعلان‌ها با موفقیت دریافت شد", {
        notifications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      }),
    );
  },
);

// ==================== دریافت اعلان‌های من (alias) ====================
export const getMyNotifications = getUserNotifications;

// ==================== آخرین اعلان‌های ادمین ====================
export const getLatestAdminNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .lean();

    res.json(
      apiResponse(true, "آخرین اعلان‌های ادمین دریافت شد", { notifications }),
    );
  },
);

// ==================== علامت زدن یک اعلان به عنوان خوانده شده ====================
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json(apiResponse(false, "اعلان یافت نشد"));
    }

    res.json(apiResponse(true, "اعلان با موفقیت خوانده شد", { notification }));
  },
);

// ==================== علامت زدن همه اعلان‌ها به عنوان خوانده شده ====================
export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await Notification.updateMany(
      { user: req.user?._id, isRead: false },
      { isRead: true },
    );

    res.json(apiResponse(true, "همه اعلان‌ها با موفقیت خوانده شد"));
  },
);

// ==================== حذف اعلان ====================
export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!notification) {
      return res.status(404).json(apiResponse(false, "اعلان یافت نشد"));
    }

    res.json(apiResponse(true, "اعلان با موفقیت حذف شد"));
  },
);
