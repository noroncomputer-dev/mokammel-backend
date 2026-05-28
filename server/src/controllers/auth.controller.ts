// backend/src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import User from "../models/user.model";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import crypto from "crypto";
import PasswordResetToken from "../models/passwordResetToken.model";
import { sendEmail } from "../utils/sendEmail";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== تابع کمکی برای تولید توکن ====================
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "30d" },
  );
  return { accessToken, refreshToken };
};

// ==================== تابع کمکی برای تنظیم کوکی‌ها (اصلاح شده برای کراس دامنه) ====================
const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  // برای کراس دامنه (Vercel → Render)
  const isProduction = process.env.NODE_ENV === "production";
  
  // تنظیم کوکی accessToken
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,           // ✅ همیشه true برای HTTPS
    sameSite: "none",       // ✅ مهم: برای کراس دامنه
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
    path: "/",
  });

  // تنظیم کوکی refreshToken
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,           // ✅ همیشه true برای HTTPS
    sameSite: "none",       // ✅ مهم: برای کراس دامنه
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 روز
    path: "/",
  });
};

// ==================== تابع کمکی برای پاک کردن کوکی‌ها ====================
const clearTokenCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};

// ==================== ثبت‌نام ====================
export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(apiResponse(false, parsed.error.issues[0].message));
    return;
  }

  const { name, email, password, phone } = parsed.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json(apiResponse(false, "این ایمیل قبلاً ثبت شده است"));
    return;
  }

  const user = await User.create({ name, email, password, phone });
  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.role,
  );

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json(
    apiResponse(true, "ثبت‌نام با موفقیت انجام شد", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    }),
  );
});

// ==================== ورود ====================
export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(apiResponse(false, parsed.error.issues[0].message));
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401).json(apiResponse(false, "ایمیل یا رمز عبور اشتباه است"));
    return;
  }

  if (!user.isActive) {
    res.status(403).json(apiResponse(false, "حساب کاربری شما مسدود شده است"));
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json(apiResponse(false, "ایمیل یا رمز عبور اشتباه است"));
    return;
  }

  const { accessToken, refreshToken } = generateTokens(
    user._id.toString(),
    user.role,
  );

  setTokenCookies(res, accessToken, refreshToken);

  res.json(
    apiResponse(true, "ورود با موفقیت انجام شد", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      },
    }),
  );
});

// ==================== خروج ====================
export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearTokenCookies(res);
  res.json(apiResponse(true, "خروج با موفقیت انجام شد"));
});

// ==================== دریافت اطلاعات کاربر جاری ====================
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json(apiResponse(false, "کاربر یافت نشد"));
    return;
  }

  res.json(
    apiResponse(true, "اطلاعات کاربر", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isActive: user.isActive,
      },
    }),
  );
});

// ==================== تمدید توکن ====================
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      res
        .status(401)
        .json(apiResponse(false, "توکن یافت نشد. لطفاً دوباره وارد شوید"));
      return;
    }

    try {
      const decoded = jwt.verify(
        refreshTokenFromCookie,
        process.env.JWT_REFRESH_SECRET as string,
      ) as { id: string; role: string };

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        res
          .status(401)
          .json(apiResponse(false, "کاربر یافت نشد یا غیرفعال است"));
        return;
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user._id.toString(),
        user.role,
      );

      setTokenCookies(res, accessToken, newRefreshToken);

      res.json(apiResponse(true, "توکن با موفقیت تمدید شد"));
    } catch (error: any) {
      console.error("Refresh token error:", error.message);
      clearTokenCookies(res);
      res
        .status(401)
        .json(
          apiResponse(
            false,
            "توکن نامعتبر یا منقضی شده است. لطفاً دوباره وارد شوید",
          ),
        );
    }
  },
);

// ==================== فراموشی رمز عبور ====================
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json(apiResponse(false, "ایمیل الزامی است"));
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.json(
        apiResponse(
          true,
          "اگر ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال خواهد شد",
        ),
      );
      return;
    }

    await PasswordResetToken.deleteMany({ email });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetToken.create({ email, token, expiresAt });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `
    <div style="font-family: Vazirmatn, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #1e293b; text-align: center;">بازیابی رمز عبور</h2>
      <p style="color: #475569;">برای بازیابی رمز عبور روی لینک زیر کلیک کنید:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #D4A017; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0;">بازیابی رمز عبور</a>
      <p style="color: #94a3b8; font-size: 12px;">این لینک تا ۱ ساعت اعتبار دارد.</p>
      <p style="color: #94a3b8; font-size: 12px;">اگر درخواست بازیابی نداده‌اید، این ایمیل را نادیده بگیرید.</p>
    </div>
  `;

    await sendEmail(email, "بازیابی رمز عبور | مکمل‌شاپ", html);

    res.json(apiResponse(true, "لینک بازیابی به ایمیل شما ارسال شد"));
  },
);

// ==================== بازنشانی رمز عبور ====================
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res
        .status(400)
        .json(apiResponse(false, "توکن و رمز عبور جدید الزامی است"));
      return;
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json(apiResponse(false, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"));
      return;
    }

    const resetToken = await PasswordResetToken.findOne({ token });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      res.status(400).json(apiResponse(false, "توکن نامعتبر یا منقضی شده است"));
      return;
    }

    const user = await User.findOne({ email: resetToken.email });
    if (!user) {
      res.status(404).json(apiResponse(false, "کاربر یافت نشد"));
      return;
    }

    user.password = newPassword;
    await user.save();

    await PasswordResetToken.deleteOne({ token });

    clearTokenCookies(res);

    res.json(
      apiResponse(true, "رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید"),
    );
  },
);
