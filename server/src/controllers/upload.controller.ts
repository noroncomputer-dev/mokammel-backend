// server/src/controllers/upload.controller.ts
import { Response } from "express";
import path from "path";
import fs from "fs";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import { AuthRequest } from "../middleware/auth.middleware";

// @route  POST /api/upload
// @desc   آپلود تصویر روی سرور محلی
// @access Admin
export const uploadImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json(apiResponse(false, "فایلی انتخاب نشده است"));
      return;
    }

    // ✅ ساخت URL قابل دسترسی از فرانت‌اند
    const baseUrl =
      process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

    // ✅ مسیر را به‌صورت قطعی می‌سازیم
    const fileUrl = `${baseUrl}/uploads/products/${file.filename}`;

    console.log("✅ Image uploaded:", {
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: fileUrl,
    });

    res.status(201).json(
      apiResponse(true, "تصویر با موفقیت آپلود شد", {
        url: fileUrl,
        publicId: file.filename,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      }),
    );
  },
);

// @route  DELETE /api/upload/:publicId
// @desc   حذف تصویر از سرور
// @access Admin
export const deleteImage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { publicId } = req.params;

    if (!publicId || typeof publicId !== "string") {
      res.status(400).json(apiResponse(false, "نام فایل نامعتبر است"));
      return;
    }

    // جلوگیری از path traversal attack
    if (publicId.includes("..") || publicId.includes("/")) {
      res.status(400).json(apiResponse(false, "نام فایل غیرمجاز است"));
      return;
    }

    const filePath = path.join(__dirname, "../../uploads/products", publicId);

    if (!fs.existsSync(filePath)) {
      res.status(404).json(apiResponse(false, "فایل یافت نشد"));
      return;
    }

    fs.unlinkSync(filePath);
    res.json(apiResponse(true, "تصویر با موفقیت حذف شد"));
  },
);

// @route  POST /api/upload/avatar
// @desc   آپلود آواتار کاربر
// @access User (خود کاربر)
export const uploadAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      res.status(400).json(apiResponse(false, "فایلی انتخاب نشده است"));
      return;
    }

    // اعتبارسنجی نوع فایل
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      res
        .status(400)
        .json(apiResponse(false, "فرمت فایل مجاز نیست (JPEG, PNG, WEBP)"));
      return;
    }

    // اعتبارسنجی حجم فایل (حداکثر ۲ مگابایت)
    if (file.size > 2 * 1024 * 1024) {
      res
        .status(400)
        .json(apiResponse(false, "حجم فایل نباید بیشتر از ۲ مگابایت باشد"));
      return;
    }

    const baseUrl =
      process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

    const fileUrl = `${baseUrl}/uploads/avatars/${file.filename}`;

    console.log("✅ Avatar uploaded:", {
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: fileUrl,
    });

    res.status(201).json(
      apiResponse(true, "آواتار با موفقیت آپلود شد", {
        url: fileUrl,
        publicId: file.filename,
        filename: file.filename,
      }),
    );
  },
);

// @route  DELETE /api/upload/avatar/:publicId
// @desc   حذف آواتار کاربر
// @access User
export const deleteAvatar = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { publicId } = req.params;

    if (!publicId || typeof publicId !== "string") {
      res.status(400).json(apiResponse(false, "نام فایل نامعتبر است"));
      return;
    }

    // جلوگیری از path traversal attack
    if (publicId.includes("..") || publicId.includes("/")) {
      res.status(400).json(apiResponse(false, "نام فایل غیرمجاز است"));
      return;
    }

    const filePath = path.join(__dirname, "../../uploads/avatars", publicId);

    if (!fs.existsSync(filePath)) {
      res.status(404).json(apiResponse(false, "فایل یافت نشد"));
      return;
    }

    fs.unlinkSync(filePath);
    res.json(apiResponse(true, "آواتار با موفقیت حذف شد"));
  },
);
