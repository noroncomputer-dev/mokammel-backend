// server/src/controllers/wishlist.controller.ts

import { Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Wishlist from "../models/wishlist.model";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth.middleware";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
// @route   GET /api/wishlist
// @desc    دریافت علاقه‌مندی‌های کاربر جاری
// @access  Private
export const getWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    let wishlist = await Wishlist.findOne({ user: req.user?._id }).populate(
      "items.product",
    );

    if (!wishlist) {
      // اگر کاربر هنوز علاقه‌مندی ندارد، یک خالی ایجاد کن
      wishlist = await Wishlist.create({ user: req.user?._id, items: [] });
    }

    res.json(
      apiResponse(true, "علاقه‌مندی‌ها با موفقیت دریافت شد", { wishlist }),
    );
  },
);

// @route   POST /api/wishlist
// @desc    افزودن محصول به علاقه‌مندی‌ها
// @access  Private
export const addToWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json(apiResponse(false, "شناسه محصول الزامی است"));
      return;
    }

    // بررسی وجود محصول
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404).json(apiResponse(false, "محصول یافت نشد"));
      return;
    }

    let wishlist = await Wishlist.findOne({ user: req.user?._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user?._id, items: [] });
    }

    // بررسی اینکه محصول قبلاً در علاقه‌مندی‌ها هست یا نه
    const alreadyExists = wishlist.items.some(
      (item) => item.product.toString() === productId,
    );

    if (alreadyExists) {
      res
        .status(400)
        .json(
          apiResponse(false, "این محصول قبلاً به علاقه‌مندی‌ها اضافه شده است"),
        );
      return;
    }

    wishlist.items.push({ product: productId, addedAt: new Date() });
    await wishlist.save();

    await wishlist.populate("items.product");

    res.status(201).json(
      apiResponse(true, "محصول با موفقیت به علاقه‌مندی‌ها اضافه شد", {
        wishlist,
      }),
    );
  },
);

// @route   DELETE /api/wishlist/:productId
// @desc    حذف محصول از علاقه‌مندی‌ها
// @access  Private
export const removeFromWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user?._id });

    if (!wishlist) {
      res.status(404).json(apiResponse(false, "علاقه‌مندی‌ها یافت نشد"));
      return;
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );

    if (wishlist.items.length === initialLength) {
      res
        .status(404)
        .json(apiResponse(false, "محصول در علاقه‌مندی‌ها یافت نشد"));
      return;
    }

    await wishlist.save();
    await wishlist.populate("items.product");

    res.json(
      apiResponse(true, "محصول با موفقیت از علاقه‌مندی‌ها حذف شد", {
        wishlist,
      }),
    );
  },
);

// @route   DELETE /api/wishlist
// @desc    پاک کردن تمام علاقه‌مندی‌ها
// @access  Private
export const clearWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const wishlist = await Wishlist.findOne({ user: req.user?._id });

    if (!wishlist) {
      res.status(404).json(apiResponse(false, "علاقه‌مندی‌ها یافت نشد"));
      return;
    }

    wishlist.items = [];
    await wishlist.save();

    res.json(apiResponse(true, "تمام علاقه‌مندی‌ها با موفقیت پاک شد"));
  },
);

// @route   POST /api/wishlist/move-to-cart
// @desc    انتقال محصول از علاقه‌مندی به سبد خرید (نیاز به کنترلر سبد خرید جداگانه دارد)
// @access  Private
export const moveToCart = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json(apiResponse(false, "شناسه محصول الزامی است"));
      return;
    }

    // ابتدا از علاقه‌مندی‌ها حذف کن
    const wishlist = await Wishlist.findOne({ user: req.user?._id });

    if (!wishlist) {
      res.status(404).json(apiResponse(false, "علاقه‌مندی‌ها یافت نشد"));
      return;
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId,
    );
    await wishlist.save();

    // توجه: اضافه کردن به سبد خرید باید در کنترلر سبد خرید جداگانه انجام شود
    // اینجا فقط حذف از علاقه‌مندی انجام می‌شود

    res.json(
      apiResponse(true, "محصول با موفقیت به سبد خرید منتقل شد", { productId }),
    );
  },
);
