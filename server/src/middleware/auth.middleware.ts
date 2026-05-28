// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import User, { IUser } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: IUser;
}

// ==================== میدلور احراز هویت (protect) ====================
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    console.log("🍪 Cookies received:", req.cookies); // برای دیباگ

    // 1️⃣ اول از کوکی بخوان
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
      console.log("✅ Token found in cookies");
    }
    // 2️⃣ اگر در کوکی نبود، از هدر Authorization بخوان
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("✅ Token found in Authorization header");
    }

    if (!token) {
      console.log("❌ No token found");
      res
        .status(401)
        .json(apiResponse(false, "دسترسی غیرمجاز — توکن یافت نشد"));
      return;
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      res.status(500).json(apiResponse(false, "خطای داخلی سرور"));
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: string;
        role?: string;
      };

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401).json(apiResponse(false, "کاربر یافت نشد"));
        return;
      }

      if (!user.isActive) {
        res
          .status(401)
          .json(apiResponse(false, "حساب کاربری شما مسدود شده است"));
        return;
      }

      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        res.status(401).json(apiResponse(false, "توکن نامعتبر است"));
      } else if (error.name === "TokenExpiredError") {
        res.status(401).json(apiResponse(false, "توکن منقضی شده است"));
      } else {
        res.status(401).json(apiResponse(false, "خطا در احراز هویت"));
      }
      return;
    }
  },
);

// ==================== میدلور بررسی نقش ادمین ====================
export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("🔐 Admin middleware - User role:", req.user?.role);

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "کاربر یافت نشد. لطفاً وارد شوید.",
    });
  }

  if (req.user.role !== "admin") {
    console.log("❌ Access denied. User role is:", req.user.role);
    return res.status(403).json({
      success: false,
      message: "دسترسی غیرمجاز. شما ادمین نیستید.",
    });
  }

  console.log("✅ Admin access granted");
  next();
};

// ==================== میدلور بررسی نقش ادمین (نام دیگر) ====================
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).json(apiResponse(false, "لطفاً وارد حساب کاربری خود شوید"));
    return;
  }

  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    res
      .status(403)
      .json(apiResponse(false, "دسترسی غیرمجاز — فقط ادمین می‌تواند وارد شود"));
    return;
  }

  next();
};

// ==================== میدلور بررسی نقش سوپر ادمین ====================
export const superAdminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).json(apiResponse(false, "لطفاً وارد حساب کاربری خود شوید"));
    return;
  }

  if (req.user.role !== "super_admin") {
    res
      .status(403)
      .json(
        apiResponse(false, "دسترسی غیرمجاز — فقط سوپر ادمین می‌تواند وارد شود"),
      );
    return;
  }

  next();
};

// ==================== میدلور بررسی اینکه کاربر لاگین شده است ====================
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    res.status(401).json(apiResponse(false, "لطفاً وارد حساب کاربری خود شوید"));
    return;
  }
  next();
};

// // ==================== تابع تولید توکن (در کنترلر استفاده می‌شود) ====================
// export const generateTokens = (userId: string, role: string) => {
//   console.log("🔑 Generating tokens for user - role:", role);

//   const accessToken = jwt.sign(
//     { id: userId, role },
//     process.env.JWT_SECRET as string,
//     { expiresIn: "15m" },
//   );

//   const refreshToken = jwt.sign(
//     { id: userId, role },
//     process.env.JWT_REFRESH_SECRET as string,
//     { expiresIn: "7d" },
//   );

//   return { accessToken, refreshToken };
// };
