// server/src/controllers/compare.controller.ts

import { Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Compare from "../models/compare.model";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth.middleware";

// @route   GET /api/compare
// @desc    دریافت لیست مقایسه کاربر جاری
// @access  Private
export const getCompareList = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    let compare = await Compare.findOne({ user: req.user?._id }).populate(
      "items.product",
    );

    if (!compare) {
      compare = await Compare.create({ user: req.user?._id, items: [] });
    }

    res.json(apiResponse(true, "لیست مقایسه با موفقیت دریافت شد", { compare }));
  },
);

// @route   POST /api/compare
// @desc    افزودن محصول به لیست مقایسه
// @access  Private
export const addToCompare = asyncHandler(
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

    let compare = await Compare.findOne({ user: req.user?._id });

    if (!compare) {
      compare = await Compare.create({ user: req.user?._id, items: [] });
    }

    // بررسی اینکه محصول قبلاً در لیست مقایسه هست یا نه
    const alreadyExists = compare.items.some(
      (item) => item.product.toString() === productId,
    );

    if (alreadyExists) {
      res
        .status(400)
        .json(
          apiResponse(false, "این محصول قبلاً به لیست مقایسه اضافه شده است"),
        );
      return;
    }

    // بررسی محدودیت حداکثر ۴ محصول
    if (compare.items.length >= 4) {
      res
        .status(400)
        .json(apiResponse(false, "حداکثر می‌توانید ۴ محصول را مقایسه کنید"));
      return;
    }

    compare.items.push({ product: productId, addedAt: new Date() });
    await compare.save();
    await compare.populate("items.product");

    res
      .status(201)
      .json(
        apiResponse(true, "محصول با موفقیت به لیست مقایسه اضافه شد", {
          compare,
        }),
      );
  },
);

// @route   DELETE /api/compare/:productId
// @desc    حذف محصول از لیست مقایسه
// @access  Private
export const removeFromCompare = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;

    const compare = await Compare.findOne({ user: req.user?._id });

    if (!compare) {
      res.status(404).json(apiResponse(false, "لیست مقایسه یافت نشد"));
      return;
    }

    const initialLength = compare.items.length;
    compare.items = compare.items.filter(
      (item) => item.product.toString() !== productId,
    );

    if (compare.items.length === initialLength) {
      res.status(404).json(apiResponse(false, "محصول در لیست مقایسه یافت نشد"));
      return;
    }

    await compare.save();
    await compare.populate("items.product");

    res.json(
      apiResponse(true, "محصول با موفقیت از لیست مقایسه حذف شد", { compare }),
    );
  },
);

// @route   DELETE /api/compare
// @desc    پاک کردن تمام لیست مقایسه
// @access  Private
export const clearCompare = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const compare = await Compare.findOne({ user: req.user?._id });

    if (!compare) {
      res.status(404).json(apiResponse(false, "لیست مقایسه یافت نشد"));
      return;
    }

    compare.items = [];
    await compare.save();

    res.json(apiResponse(true, "لیست مقایسه با موفقیت پاک شد"));
  },
);

// @route   GET /api/compare/fields
// @desc    دریافت فیلدهای قابل مقایسه برای محصولات (پویا)
// @access  Private
export const getCompareFields = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const compare = await Compare.findOne({ user: req.user?._id }).populate(
      "items.product",
    );

    if (!compare || compare.items.length === 0) {
      res.status(404).json(apiResponse(false, "محصولی برای مقایسه وجود ندارد"));
      return;
    }

    // استخراج فیلدهای قابل مقایسه از محصولات
    const fields = [
      { key: "name", label: "نام محصول", type: "text" },
      { key: "price", label: "قیمت", type: "currency" },
      { key: "discountPrice", label: "قیمت تخفیف", type: "currency" },
      { key: "rating", label: "امتیاز", type: "rating" },
      { key: "reviewCount", label: "تعداد نظرات", type: "number" },
      { key: "stock", label: "موجودی", type: "stock" },
      { key: "brand.name", label: "برند", type: "text" },
      { key: "category.name", label: "دسته‌بندی", type: "text" },
      { key: "flavors", label: "طعم‌ها", type: "list" },
      { key: "weights", label: "وزن‌ها", type: "list" },
      { key: "nutritionFacts.calories", label: "کالری", type: "nutrition" },
      { key: "nutritionFacts.protein", label: "پروتئین", type: "nutrition" },
      { key: "nutritionFacts.carbs", label: "کربوهیدرات", type: "nutrition" },
      { key: "nutritionFacts.fat", label: "چربی", type: "nutrition" },
    ];

    // داده‌های مقایسه برای هر محصول
    const compareData = compare.items.map((item: any) => {
      const product = item.product;
      return {
        id: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        brand: product.brand,
        category: product.category,
        flavors: product.flavors,
        weights: product.weights,
        nutritionFacts: product.nutritionFacts,
        images: product.images,
        shortDescription: product.shortDescription,
      };
    });

    res.json(
      apiResponse(true, "فیلدهای مقایسه با موفقیت دریافت شد", {
        fields,
        products: compareData,
        count: compare.items.length,
      }),
    );
  },
);
