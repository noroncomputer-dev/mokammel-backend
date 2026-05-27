// backend/src/controllers/brand.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Brand from "../models/brand.model";
import { AuthRequest } from "../middleware/auth.middleware";

// @route GET /api/brands
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort("name");
    res.json(apiResponse(true, "برندها با موفقیت دریافت شد", { brands }));
  } catch (error: any) {
    console.error("Error in getBrands:", error);
    res
      .status(500)
      .json(apiResponse(false, error.message || "خطا در دریافت برندها"));
  }
});

// @route GET /api/brands/all
export const getAllBrands = asyncHandler(
  async (req: Request, res: Response) => {
    const brands = await Brand.find().sort({ order: 1, name: 1 });
    res.json(apiResponse(true, "همه برندها با موفقیت دریافت شد", { brands }));
  },
);

// @route GET /api/brands/active
export const getActiveBrands = asyncHandler(
  async (req: Request, res: Response) => {
    const brands = await Brand.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    res.json(apiResponse(true, "برندهای فعال با موفقیت دریافت شد", { brands }));
  },
);

// @route GET /api/brands/:id
export const getBrandById = asyncHandler(
  async (req: Request, res: Response) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json(apiResponse(false, "برند یافت نشد"));
    }
    res.json(apiResponse(true, "برند با موفقیت دریافت شد", { brand }));
  },
);

// @route GET /api/brands/slug/:slug
export const getBrandBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand) {
      return res.status(404).json(apiResponse(false, "برند یافت نشد"));
    }
    res.json(apiResponse(true, "برند با موفقیت دریافت شد", { brand }));
  },
);

// @route POST /api/brands (admin)
export const createBrand = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description, logo, origin, order, isActive } = req.body;

    // بررسی تکراری بودن
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return res
        .status(400)
        .json(apiResponse(false, "این برند قبلاً ثبت شده است"));
    }

    const brand = await Brand.create({
      name,
      description,
      logo,
      origin,
      order: order || 0,
      isActive: isActive ?? true,
    });

    res
      .status(201)
      .json(apiResponse(true, "برند با موفقیت ایجاد شد", { brand }));
  },
);

// @route PUT /api/brands/:id (admin)
export const updateBrand = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!brand) {
      return res.status(404).json(apiResponse(false, "برند یافت نشد"));
    }

    res.json(apiResponse(true, "برند با موفقیت بروزرسانی شد", { brand }));
  },
);

// @route DELETE /api/brands/:id (admin)
export const deleteBrand = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!brand) {
      return res.status(404).json(apiResponse(false, "برند یافت نشد"));
    }

    res.json(apiResponse(true, "برند با موفقیت حذف شد"));
  },
);

// @route DELETE /api/brands/:id/permanent (admin)
export const permanentDeleteBrand = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json(apiResponse(false, "برند یافت نشد"));
    }

    res.json(apiResponse(true, "برند به طور کامل حذف شد"));
  },
);
