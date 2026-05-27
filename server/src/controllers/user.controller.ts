import { Request, Response } from "express";
import mongoose from "mongoose";
import User, { IUser } from "../models/user.model";
import Order from "../models/order.model";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Review from "../models/review.model";
import Notification from "../models/notification.model";
import Ticket from "../models/ticket.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== تابع کمکی برای صفحه‌بندی ====================
const getPagination = (page: number, limit: number, total: number) => ({
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

// ==================== دریافت همه کاربران (فقط ادمین) ====================
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const search = (req.query.search as string) || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: { users },
      pagination: getPagination(page, limit, total),
    });
  },
);

// ==================== دریافت یک کاربر ====================
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password").lean();

  if (!user) {
    res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    return;
  }

  res.json({ success: true, data: user });
});

// ==================== بروزرسانی کاربر ====================
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, phone, role, isActive },
    { new: true, runValidators: true },
  )
    .select("-password")
    .lean();

  if (!user) {
    res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    return;
  }

  res.json({ success: true, data: user });
});

// ==================== حذف کاربر ====================
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    return;
  }

  res.json({ success: true, message: "کاربر حذف شد" });
});

// ==================== ایجاد کاربر جدید توسط ادمین ====================
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role, isActive } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res
      .status(400)
      .json({ success: false, message: "این ایمیل قبلاً ثبت شده است" });
    return;
  }

  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone: phone || "",
    role: role || "user",
    isActive: isActive ?? true,
  });

  const userWithoutPassword = user.toObject();
  delete (userWithoutPassword as any).password;

  res.status(201).json({ success: true, data: userWithoutPassword });
});

// ==================== دریافت آمار کاربر جاری ====================
export const getUserStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      res
        .status(401)
        .json(apiResponse(false, "لطفاً وارد حساب کاربری خود شوید"));
      return;
    }

    const userIdStr = userId.toString();

    // اجرای همزمان کوئری‌ها
    const [orders, userData, reviewCount, unreadNotifications, pendingTickets] =
      await Promise.all([
        Order.find({ user: userId }),
        User.findById(userId),
        Review.countDocuments({ user: userId }),
        Notification.countDocuments({ user: userId, isRead: false }).catch(
          () => 0,
        ),
        Ticket.countDocuments({
          user: userId,
          status: { $in: ["open", "in_progress"] },
        }).catch(() => 0),
      ]);

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.finalPrice || 0),
      0,
    );
    const wishlistCount = userData?.wishlist?.length || 0;

    res.json(
      apiResponse(true, "آمار کاربر با موفقیت دریافت شد", {
        totalOrders,
        totalSpent,
        wishlistCount,
        reviewCount,
        unreadNotifications,
        pendingTickets,
      }),
    );
  },
);

// ==================== دریافت لیست علاقه‌مندی‌ها ====================
export const getWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId).populate({
      path: "wishlist",
      select: "_id name slug price discountPrice images brand",
      populate: { path: "brand", select: "name" },
    });

    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    res.json(
      apiResponse(true, "لیست علاقه‌مندی‌ها با موفقیت دریافت شد", {
        products: user.wishlist || [],
      }),
    );
  },
);

// ==================== افزودن به علاقه‌مندی‌ها ====================
export const addToWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json(apiResponse(false, "شناسه محصول الزامی است"));
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    if (!user.wishlist.some((id) => id.equals(productObjectId))) {
      user.wishlist.push(productObjectId);
      await user.save();
    }

    res.json(apiResponse(true, "محصول به علاقه‌مندی‌ها اضافه شد"));
  },
);

// ==================== حذف از علاقه‌مندی‌ها ====================
export const removeFromWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    res.json(apiResponse(true, "محصول از علاقه‌مندی‌ها حذف شد"));
  },
);

// ==================== افزودن آدرس جدید ====================
export const addAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { fullName, phone, province, city, address, postalCode, isDefault } =
      req.body;

    // اعتبارسنجی
    if (!fullName || !phone || !province || !city || !address || !postalCode) {
      res.status(400).json(apiResponse(false, "تمام فیلدهای آدرس الزامی است"));
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    // اگر این آدرس پیش‌فرض است، سایر آدرس‌ها را غیرپیش‌فرض کن
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // افزودن آدرس جدید
    user.addresses.push({
      fullName,
      phone,
      province,
      city,
      address,
      postalCode,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json(
      apiResponse(true, "آدرس با موفقیت اضافه شد", {
        addresses: user.addresses,
      }),
    );
  },
);

// ==================== ویرایش آدرس ====================
export const updateAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { addressId } = req.params;
    const { fullName, phone, province, city, address, postalCode, isDefault } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    // پیدا کردن آدرس
    const addressIndex = user.addresses.findIndex(
      (addr: any) => addr._id && addr._id.toString() === addressId,
    );

    if (addressIndex === -1) {
      res.status(404).json(apiResponse(false, "آدرس یافت نشد"));
      return;
    }

    // اگر این آدرس پیش‌فرض است، سایر آدرس‌ها را غیرپیش‌فرض کن
    if (isDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // به روز رسانی آدرس
    user.addresses[addressIndex].fullName = fullName;
    user.addresses[addressIndex].phone = phone;
    user.addresses[addressIndex].province = province;
    user.addresses[addressIndex].city = city;
    user.addresses[addressIndex].address = address;
    user.addresses[addressIndex].postalCode = postalCode;
    user.addresses[addressIndex].isDefault = isDefault || false;

    await user.save();

    res.json(
      apiResponse(true, "آدرس با موفقیت ویرایش شد", {
        addresses: user.addresses,
      }),
    );
  },
);

// ==================== حذف آدرس ====================
export const deleteAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    // فیلتر کردن و حذف آدرس مورد نظر
    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      (addr: any) => !(addr._id && addr._id.toString() === addressId),
    );

    if (user.addresses.length === initialLength) {
      res.status(404).json(apiResponse(false, "آدرس یافت نشد"));
      return;
    }

    // اگر آدرس حذف شده پیش‌فرض بود و آدرس دیگری وجود دارد، اولین آدرس را پیش‌فرض کن
    if (user.addresses.length > 0) {
      const hasDefault = user.addresses.some((addr: any) => addr.isDefault);
      if (!hasDefault) {
        user.addresses[0].isDefault = true;
      }
    }

    await user.save();

    res.json(
      apiResponse(true, "آدرس با موفقیت حذف شد", {
        addresses: user.addresses,
      }),
    );
  },
);

// ==================== تنظیم آدرس پیش‌فرض ====================
export const setDefaultAddress = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    // بررسی وجود آدرس
    const addressExists = user.addresses.some(
      (addr: any) => addr._id && addr._id.toString() === addressId,
    );

    if (!addressExists) {
      res.status(404).json(apiResponse(false, "آدرس یافت نشد"));
      return;
    }

    // تنظیم آدرس پیش‌فرض
    user.addresses.forEach((addr: any) => {
      if (addr._id) {
        addr.isDefault = addr._id.toString() === addressId;
      }
    });

    await user.save();

    res.json(
      apiResponse(true, "آدرس پیش‌فرض با موفقیت تنظیم شد", {
        addresses: user.addresses,
      }),
    );
  },
);

// ==================== دریافت لیست آدرس‌ها ====================
export const getAddresses = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    res.json(
      apiResponse(true, "لیست آدرس‌ها با موفقیت دریافت شد", {
        addresses: user.addresses || [],
      }),
    );
  },
);
// ==================== آپلود آواتار کاربر ====================
export const uploadAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      res.status(400).json(apiResponse(false, "آدرس تصویر الزامی است"));
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");

    res.json(apiResponse(true, "آواتار با موفقیت آپدیت شد", { user }));
  },
);
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { name, phone } = req.body;

    if (!userId) {
      res
        .status(401)
        .json(apiResponse(false, "لطفاً وارد حساب کاربری خود شوید"));
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "پروفایل با موفقیت بروزرسانی شد", { user }));
  },
);

// ==================== بروزرسانی آواتار ====================
export const updateAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { avatarUrl } = req.body;

    if (!userId) {
      res
        .status(401)
        .json(apiResponse(false, "لطفاً وارد حساب کاربری خود شوید"));
      return;
    }

    if (!avatarUrl) {
      res.status(400).json(apiResponse(false, "آدرس تصویر الزامی است"));
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true },
    ).select("-password");

    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "آواتار با موفقیت بروزرسانی شد", { user }));
  },
);
