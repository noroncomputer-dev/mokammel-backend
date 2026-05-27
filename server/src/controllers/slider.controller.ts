import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Slider from "../models/slider.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== دریافت اسلایدهای فعال (برای فرانت‌اند) ====================
export const getActiveSlides = asyncHandler(
  async (req: Request, res: Response) => {
    const slides = await Slider.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    res.json(apiResponse(true, "اسلایدها با موفقیت دریافت شد", { slides }));
  },
);

// ==================== دریافت همه اسلایدها (برای ادمین) ====================
export const getAllSlides = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const slides = await Slider.find().sort({ order: 1 }).lean();
    res.json(apiResponse(true, "اسلایدها با موفقیت دریافت شد", { slides }));
  },
);

// ==================== ایجاد اسلاید جدید ====================
export const createSlide = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { title, subtitle, image, link, order, buttonText, isActive } =
      req.body;

    if (!title || !image) {
      res
        .status(400)
        .json(apiResponse(false, "عنوان و تصویر اسلاید الزامی است"));
      return;
    }

    const slide = await Slider.create({
      title,
      subtitle: subtitle || "",
      image,
      link: link || "/products",
      order: order || 0,
      buttonText: buttonText || "مشاهده محصولات",
      isActive: isActive !== undefined ? isActive : true,
    });

    res
      .status(201)
      .json(apiResponse(true, "اسلاید با موفقیت ایجاد شد", { slide }));
  },
);

// ==================== بروزرسانی اسلاید ====================
export const updateSlide = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const slide = await Slider.findByIdAndUpdate(id, updateData, { new: true });

    if (!slide) {
      res.status(404).json(apiResponse(false, "اسلاید یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "اسلاید با موفقیت بروزرسانی شد", { slide }));
  },
);

// ==================== حذف اسلاید ====================
export const deleteSlide = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const slide = await Slider.findByIdAndDelete(id);

    if (!slide) {
      res.status(404).json(apiResponse(false, "اسلاید یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "اسلاید با موفقیت حذف شد"));
  },
);
