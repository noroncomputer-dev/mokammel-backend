// server/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  console.error("❌ Error Middleware:", {
    message: err?.message,
    name: err?.name,
    code: err?.code,
    path: req.path,
    method: req.method,
  });

  // ─── خطاهای Multer (آپلود فایل) ─────────────────────────
  if (err instanceof multer.MulterError) {
    let message = "خطا در آپلود فایل";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "حجم فایل نباید بیشتر از ۵ مگابایت باشد";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "فیلد فایل نامعتبر است (انتظار فیلد 'image' را داشتیم)";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "تعداد فایل‌ها بیشتر از حد مجاز است";
    }
    res.status(400).json({
      success: false,
      message,
      data: null,
    });
    return;
  }

  // ─── خطاهای Validation (Mongoose) ───────────────────────
  if (err?.name === "ValidationError") {
    const messages = Object.values(err.errors || {})
      .map((e: any) => e?.message)
      .filter(Boolean);
    res.status(400).json({
      success: false,
      message: messages.join(" | ") || "اطلاعات نامعتبر است",
      data: null,
    });
    return;
  }

  // ─── خطاهای CastError (شناسه نامعتبر) ────────────────────
  if (err?.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "شناسه نامعتبر است",
      data: null,
    });
    return;
  }

  // ─── خطاهای کلیدتکراری (duplicate key) ───────────────────
  if (err?.code === 11000) {
    res.status(409).json({
      success: false,
      message: "این مقدار قبلاً ثبت شده است",
      data: null,
    });
    return;
  }

  // ─── خطاهای JWT ──────────────────────────────────────────
  if (
    err?.name === "JsonWebTokenError" ||
    err?.name === "TokenExpiredError"
  ) {
    res.status(401).json({
      success: false,
      message: "توکن نامعتبر یا منقضی شده",
      data: null,
    });
    return;
  }

  // ─── خطاهای fileFilter (filter ما) ───────────────────────
  // اگر پیام فارسی فایل ما بود ⇒ 400 برگردان
  if (
    typeof err?.message === "string" &&
    err.message.includes("فقط فایل‌های")
  ) {
    res.status(400).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // ─── خطای پیش‌فرض ────────────────────────────────────────
  // اگر res.statusCode از قبل ست شده باشد (مثلاً 400) همان را نگه‌دار
  // در غیر این صورت 500
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err?.message || "خطای داخلی سرور",
    data: null,
  });
};

export default errorMiddleware;
