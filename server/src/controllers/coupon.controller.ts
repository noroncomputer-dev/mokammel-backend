// server/src/controllers/coupon.controller.ts

import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Coupon from "../models/coupon.model";
import { AuthRequest } from "../middleware/auth.middleware";

// @route   POST /api/coupons/apply
// @desc    اعمال کد تخفیف و محاسبه مبلغ نهایی
// @access  Private (کاربر عادی)
export const applyCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code, totalPrice } = req.body;

    if (!code || !totalPrice) {
      res.status(400).json(apiResponse(false, "کد تخفیف و مبلغ کل الزامی است"));
      return;
    }

    // پیدا کردن کوپن فعال و معتبر
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gte: new Date() },
    });

    if (!coupon) {
      res
        .status(404)
        .json(apiResponse(false, "کد تخفیف معتبر نیست یا منقضی شده است"));
      return;
    }

    // بررسی محدودیت استفاده
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res
        .status(400)
        .json(apiResponse(false, "ظرفیت استفاده از این کد تخفیف تمام شده است"));
      return;
    }

    // بررسی حداقل مبلغ سفارش
    if (coupon.minOrderAmount && totalPrice < coupon.minOrderAmount) {
      res
        .status(400)
        .json(
          apiResponse(
            false,
            `حداقل مبلغ سفارش برای این کد ${coupon.minOrderAmount.toLocaleString()} تومان است`,
          ),
        );
      return;
    }

    // محاسبه مبلغ تخفیف
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (totalPrice * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.value;
    }

    const finalPrice = Math.max(totalPrice - discountAmount, 0);

    res.json(
      apiResponse(true, "کد تخفیف با موفقیت اعمال شد", {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
        },
        discountAmount,
        finalPrice,
      }),
    );
  },
);

// @route   GET /api/coupons
// @desc    دریافت همه کدهای تخفیف (با قابلیت فیلتر)
// @access  Private (فقط ادمین)
export const getAllCoupons = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, isActive } = req.query;

    const filter: Record<string, any> = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort("-createdAt").skip(skip).limit(limitNum),
      Coupon.countDocuments(filter),
    ]);

    res.json(
      apiResponse(true, "کدهای تخفیف با موفقیت دریافت شد", {
        coupons,
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

// @route   GET /api/coupons/:id
// @desc    دریافت یک کد تخفیف
// @access  Private (فقط ادمین)
export const getCouponById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      res.status(404).json(apiResponse(false, "کد تخفیف یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "کد تخفیف با موفقیت دریافت شد", { coupon }));
  },
);

// @route   POST /api/coupons
// @desc    ایجاد کد تخفیف جدید
// @access  Private (فقط ادمین)
export const createCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    // اعتبارسنجی فیلدهای اجباری
    if (!code) {
      return res.status(400).json(apiResponse(false, "کد تخفیف الزامی است"));
    }
    if (!value || value <= 0) {
      return res.status(400).json(apiResponse(false, "مقدار تخفیف الزامی است"));
    }
    if (!expiresAt) {
      return res.status(400).json(apiResponse(false, "تاریخ انقضا الزامی است"));
    }

    // بررسی تکراری نبودن کد
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res
        .status(400)
        .json(apiResponse(false, "این کد تخفیف قبلاً ثبت شده است"));
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : 1,
      usedCount: 0,
      expiresAt: new Date(expiresAt),
      isActive: isActive ?? true,
    });

    res
      .status(201)
      .json(apiResponse(true, "کد تخفیف با موفقیت ایجاد شد", { coupon }));
  },
);

// @route   PUT /api/coupons/:id
// @desc    بروزرسانی کد تخفیف
// @access  Private (فقط ادمین)
export const updateCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const updateData: any = { ...req.body };

    // بروزرسانی کد به حروف بزرگ
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    // تبدیل مقادیر عددی به فرمت مناسب مدل
    if (updateData.value !== undefined) {
      updateData.value = Number(updateData.value);
    }
    if (updateData.minOrderAmount !== undefined) {
      updateData.minOrderAmount = Number(updateData.minOrderAmount);
    }
    if (updateData.maxDiscount !== undefined) {
      updateData.maxDiscount = Number(updateData.maxDiscount);
    }
    if (updateData.usageLimit !== undefined) {
      updateData.usageLimit = Number(updateData.usageLimit);
    }
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }

    // حذف فیلدهایی که در مدل وجود ندارند
    delete updateData.discountType;
    delete updateData.discountValue;
    delete updateData.maxDiscountAmount;
    delete updateData.endDate;
    delete updateData.startDate;
    delete updateData.description;

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!coupon) {
      return res.status(404).json(apiResponse(false, "کد تخفیف یافت نشد"));
    }

    res.json(apiResponse(true, "کد تخفیف با موفقیت بروزرسانی شد", { coupon }));
  },
);

// @route   DELETE /api/coupons/:id
// @desc    حذف (غیرفعال کردن) کد تخفیف
// @access  Private (فقط ادمین)
export const deleteCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!coupon) {
      return res.status(404).json(apiResponse(false, "کد تخفیف یافت نشد"));
    }

    res.json(apiResponse(true, "کد تخفیف با موفقیت حذف شد"));
  },
);
