import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Order from "../models/order.model";
import Product from "../models/product.model";
import Coupon from "../models/coupon.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createAdminNotification,
  notifyOrderCreated,
  notifyOrderStatusChanged,
} from "./notification.controller";

// ==================== ایجاد سفارش جدید ====================
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      items,
      shippingAddress,
      totalPrice,
      discountAmount,
      finalPrice,
      couponCode,
      paymentMethod,
      notes,
    } = req.body;

    // ─── اعتبارسنجی ───
    if (!items || items.length === 0) {
      res.status(400).json(apiResponse(false, "سبد خرید خالی است"));
      return;
    }
    if (!shippingAddress?.fullName || !shippingAddress?.phone) {
      res.status(400).json(apiResponse(false, "اطلاعات آدرس کامل نیست"));
      return;
    }

    try {
      // ─── بررسی موجودی ───
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          res
            .status(404)
            .json(apiResponse(false, `محصول ${item.name} یافت نشد`));
          return;
        }
        if (product.stock < item.quantity) {
          res
            .status(400)
            .json(apiResponse(false, `موجودی محصول ${product.name} کافی نیست`));
          return;
        }
      }

      // ─── ساخت شماره سفارش ───
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const count = await Order.countDocuments();
      const orderNumber = `ORD-${year}${month}${day}-${(count + 1).toString().padStart(4, "0")}`;

      // ─── ایجاد سفارش ───
      const order = await Order.create({
        orderNumber,
        user: req.user?._id,
        items: items.map((item: any) => ({
          product: item.productId,
          name: item.name,
          image: item.image || "",
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          flavor: item.flavor || "",
          weight: item.weight || "",
        })),
        shippingAddress,
        totalPrice,
        discountAmount: discountAmount || 0,
        finalPrice,
        couponCode: couponCode || "",
        paymentMethod: paymentMethod || "zarinpal",
        notes: notes || "",
        status: "pending",
        paymentStatus: "unpaid",
      });

      console.log("✅ Order created:", order._id, order.orderNumber);

      // ─── اعلان‌ها (بعد از ساخت order) ───
      await Promise.allSettled([
        createAdminNotification(
          "سفارش جدید",
          `سفارش جدیدی با شماره ${order.orderNumber} ثبت شد`,
          "order",
        ),
        notifyOrderCreated(
          order.user.toString(),
          order._id.toString(),
          order.orderNumber,
        ),
      ]);

      // ─── کاهش موجودی ───
      await Promise.all(
        items.map((item: any) =>
          Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity, sold: item.quantity },
          }),
        ),
      );

      // ─── افزایش استفاده از کوپن ───
      if (couponCode) {
        await Coupon.findOneAndUpdate(
          { code: couponCode },
          { $inc: { usedCount: 1 } },
        );
      }

      res.status(201).json(
        apiResponse(true, "سفارش با موفقیت ثبت شد", {
          order: {
            _id: order._id,
            orderNumber: order.orderNumber,
            finalPrice: order.finalPrice,
            status: order.status,
            createdAt: order.createdAt,
          },
        }),
      );
    } catch (error: any) {
      console.error("❌ Error creating order:", error);
      res
        .status(500)
        .json(apiResponse(false, error.message || "خطا در ثبت سفارش"));
    }
  },
);

// ==================== بروزرسانی وضعیت سفارش (ادمین) ====================
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, trackingCode } = req.body;
    const { id } = req.params;

    const updateData: any = { status };
    if (status === "delivered") updateData.deliveredAt = new Date();
    if (status === "paid") {
      updateData.paymentStatus = "paid";
      updateData.paidAt = new Date();
    }
    if (trackingCode) updateData.trackingCode = trackingCode;

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    if (!order) {
      res.status(404).json(apiResponse(false, "سفارش یافت نشد"));
      return;
    }

    await notifyOrderStatusChanged(
      order.user.toString(),
      order._id.toString(),
      order.orderNumber,
      status,
    );

    res.json(apiResponse(true, "وضعیت سفارش بروزرسانی شد", { order }));
  },
);

// ==================== سفارشات کاربر جاری ====================
export const getMyOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user?._id })
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select(
          "orderNumber totalPrice finalPrice status paymentStatus createdAt items",
        ),
      Order.countDocuments({ user: req.user?._id }),
    ]);

    res.json(
      apiResponse(true, "سفارشات با موفقیت دریافت شد", {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      }),
    );
  },
);

// ==================== جزئیات یک سفارش ====================
export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === "admin";

    // اگر ادمین نیست، فقط سفارش خودش را ببیند
    const query: any = { _id: id };
    if (!isAdmin) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate("user", "name email phone")
      .populate("items.product", "name images slug")
      .lean();

    if (!order) {
      res.status(404).json(apiResponse(false, "سفارش یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "جزئیات سفارش با موفقیت دریافت شد", { order }));
  },
);

// ==================== همه سفارشات (ادمین) ====================
export const getAllOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.phone": { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json(
      apiResponse(true, "همه سفارشات دریافت شد", {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
      }),
    );
  },
);

// ==================== بروزرسانی وضعیت پرداخت ====================
export const updatePaymentStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { paymentStatus, zarinpalRefId } = req.body;
    const { id } = req.params;

    const updateData: any = { paymentStatus };
    if (paymentStatus === "paid") updateData.paidAt = new Date();
    if (zarinpalRefId) updateData.zarinpalRefId = zarinpalRefId;

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });
    if (!order) {
      res.status(404).json(apiResponse(false, "سفارش یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "وضعیت پرداخت بروزرسانی شد", { order }));
  },
);

// ==================== پیگیری سفارش ====================
export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  // ✅ اصلاح: تبدیل صریح به string
  const rawOrderNumber = req.params.orderNumber;
  const orderNumberStr = Array.isArray(rawOrderNumber)
    ? rawOrderNumber[0]
    : rawOrderNumber;
  const cleanOrderNumber = orderNumberStr.replace(/^#/, "");

  const order = await Order.findOne({ orderNumber: cleanOrderNumber })
    .select("_id orderNumber status finalPrice createdAt")
    .lean();

  if (!order) {
    res.status(404).json(apiResponse(false, "سفارش یافت نشد"));
    return;
  }

  res.json(apiResponse(true, "سفارش یافت شد", { order }));
});

// ==================== آمار سفارشات ====================
export const getOrderStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const [totalOrders, todayOrders, weekOrders, monthOrders, statusCounts] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

    res.json(
      apiResponse(true, "آمار سفارشات دریافت شد", {
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        statusBreakdown: statusCounts,
      }),
    );
  },
);
