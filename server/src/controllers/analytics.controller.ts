import { Request, Response } from "express";
import Order from "../models/order.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";

interface AuthRequest extends Request {
  user?: any;
}

// ==================== تابع کمکی برای تبدیل تاریخ به محدوده روز ====================
const getDateRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ==================== آمار عمومی ====================
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const [totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
    ]);

    const salesAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalPrice" } } },
    ]);
    const totalSales = salesAgg[0]?.total || 0;

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 5 },
    });

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          soldCount: { $sum: "$items.quantity" },
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$product.name", "محصول حذف شده"] },
          soldCount: 1,
        },
      },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .select("_id finalPrice createdAt user orderNumber");

    const persianMonths = [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];
    const monthlySales = [];
    for (let i = 1; i <= 12; i++) {
      const startDate = new Date(year, i - 1, 1);
      const endDate = new Date(year, i, 0);
      endDate.setHours(23, 59, 59, 999);
      const result = await Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: "$finalPrice" } } },
      ]);
      monthlySales.push({
        month: persianMonths[i - 1],
        sales: result[0]?.total || 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSales,
        totalProducts,
        totalUsers,
        pendingOrders,
        lowStockProducts,
        topProducts,
        recentOrders,
        monthlySales,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "خطا در دریافت آمار" });
  }
};

// ==================== آمار داشبورد ====================
export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      todaySalesAgg,
      yesterdaySalesAgg,
      monthSalesAgg,
      yearSalesAgg,
      newOrdersToday,
      newOrdersYesterday,
      newOrdersWeek,
      totalOrders,
      totalUsers,
      newUsersToday,
      newUsersYesterday,
      newUsersWeek,
      totalProducts,
      lowStockProducts,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$finalPrice" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: yesterday, $lt: today },
            paymentStatus: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$finalPrice" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthStart }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$finalPrice" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: yearStart }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$finalPrice" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      Order.countDocuments({ createdAt: { $gte: weekAgo } }),
      Order.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 5 } }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
    ]);

    const calcChange = (a: number, b: number) =>
      b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100);

    const todaySales = todaySalesAgg[0]?.total || 0;
    const yesterdaySales = yesterdaySalesAgg[0]?.total || 0;
    const monthSales = monthSalesAgg[0]?.total || 0;
    const yearSales = yearSalesAgg[0]?.total || 0;
    const conversionRate =
      totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
    const monthlyTarget = Math.min(
      Math.round((monthSales / 500_000_000) * 100),
      100,
    );

    res.json(
      apiResponse(true, "آمار داشبورد دریافت شد", {
        totalSalesToday: todaySales,
        totalSalesYesterday: yesterdaySales,
        totalSalesMonth: monthSales,
        totalSalesYear: yearSales,
        salesChangePercent: calcChange(todaySales, yesterdaySales),
        newOrdersToday,
        newOrdersYesterday,
        newOrdersWeek,
        totalOrders,
        ordersChangePercent: calcChange(newOrdersToday, newOrdersYesterday),
        totalUsers,
        newUsersToday,
        newUsersYesterday,
        newUsersWeek,
        usersChangePercent: calcChange(newUsersToday, newUsersYesterday),
        totalProducts,
        lowStockProducts,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        conversionRate,
        monthlyTarget,
      }),
    );
  },
);

// ==================== محصولات پرفروش ====================
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          soldCount: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { soldCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$product.name", "محصول حذف شده"] },
          soldCount: 1,
          totalRevenue: 1,
          price: "$product.price",
          image: { $arrayElemAt: ["$product.images", 0] },
        },
      },
    ]);
    res.json({ success: true, data: topProducts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== فروش روزانه ====================
export const getDailySales = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const dailySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total: { $sum: "$finalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    res.json({ success: true, data: dailySales });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
