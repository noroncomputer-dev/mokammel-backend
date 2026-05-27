import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Category from "../models/category.model";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth.middleware";

// @route GET /api/categories
export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const categories = await Category.find({ isActive: true }).sort("name");

      // اضافه کردن productCount به هر دسته
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true,
          });

          return {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            order: (category as any).order,
            isActive: category.isActive,
            productCount,
          };
        }),
      );

      res.json(
        apiResponse(true, "دسته بندی ها با موفقیت دریافت شد", {
          categories: categoriesWithCount,
        }),
      );
    } catch (error: any) {
      console.error("Error in getCategories:", error);
      res
        .status(500)
        .json(
          apiResponse(false, error.message || "خطا در دریافت دسته‌بندی‌ها"),
        );
    }
  },
);

// @route GET /api/categories/active
export const getActiveCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    // اضافه کردن productCount به هر دسته
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category._id,
          isActive: true,
        });

        return {
          ...category,
          productCount,
        };
      }),
    );

    res.json(
      apiResponse(true, "دسته بندی های فعال با موفقیت دریافت شد", {
        categories: categoriesWithCount,
      }),
    );
  },
);

// @route GET /api/categories/:id/count (دریافت تعداد محصولات یک دسته خاص)
export const getCategoryProductCount = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json(apiResponse(false, "دسته بندی یافت نشد"));
    }

    const productCount = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    res.json(
      apiResponse(true, "تعداد محصولات دسته بندی با موفقیت دریافت شد", {
        categoryId: category._id,
        categoryName: category.name,
        productCount,
      }),
    );
  },
);

// @route POST /api/categories (admin)
export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await Category.create(req.body);
    res
      .status(201)
      .json(apiResponse(true, "دسته‌بندی با موفقیت ایجاد شد", { category }));
  },
);

// @route PUT /api/categories/:id (admin)
export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      res.status(404).json(apiResponse(false, "دسته بندی یافت نشد"));
      return;
    }
    res.json(
      apiResponse(true, "دسته بندی با موفقیت بروز رسانی شد", { category }),
    );
  },
);

// @route DELETE /api/categories/:id (admin)
export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!category) {
      res.status(404).json(apiResponse(false, "دسته‌بندی یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "دسته‌بندی با موفقیت حذف شد"));
  },
);
