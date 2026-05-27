// backend/src/controllers/promo.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Promo, { IPromo } from "../models/promo.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== دریافت بنرهای فعال (برای صفحه اصلی) ====================
export const getActivePromos = asyncHandler(
  async (req: Request, res: Response) => {
    const promos = await Promo.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json(apiResponse(true, "بنرها با موفقیت دریافت شد", { promos }));
  },
);

// ==================== دریافت همه بنرها (برای ادمین) ====================
export const getAllPromos = asyncHandler(
  async (req: Request, res: Response) => {
    const promos = await Promo.find().sort({ order: 1, createdAt: -1 });
    res.json(apiResponse(true, "بنرها با موفقیت دریافت شد", { promos }));
  },
);

// ==================== ایجاد بنر جدید (ادمین) ====================
export const createPromo = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const promo = await Promo.create(req.body);
    res
      .status(201)
      .json(apiResponse(true, "بنر با موفقیت ایجاد شد", { promo }));
  },
);

// ==================== بروزرسانی بنر (ادمین) ====================
export const updatePromo = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!promo) {
      return res.status(404).json(apiResponse(false, "بنر یافت نشد"));
    }

    res.json(apiResponse(true, "بنر با موفقیت بروزرسانی شد", { promo }));
  },
);

// ==================== حذف بنر (ادمین) ====================
export const deletePromo = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const promo = await Promo.findByIdAndDelete(req.params.id);

    if (!promo) {
      return res.status(404).json(apiResponse(false, "بنر یافت نشد"));
    }

    res.json(apiResponse(true, "بنر با موفقیت حذف شد"));
  },
);

// ==================== حذف چند بنر (ادمین) ====================
export const deleteManyPromos = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json(apiResponse(false, "آیدی‌های معتبر ارسال کنید"));
    }

    const result = await Promo.deleteMany({ _id: { $in: ids } });

    res.json(apiResponse(true, `${result.deletedCount} بنر با موفقیت حذف شد`));
  },
);
