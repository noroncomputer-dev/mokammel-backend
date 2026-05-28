// backend/src/controllers/product.controller.ts
import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== تابع کمکی برای ساخت اسلاگ ====================
const generateSlug = (name: string): string => {
  if (!name) return `product-${Date.now()}`;
  return name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// ==================== دریافت لیست محصولات با فیلتر ====================
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 12);
  const skip = (page - 1) * limit;

  // ساخت فیلتر داینامیک
  const filter: Record<string, any> = { isActive: true };

  // فیلتر دسته‌بندی (با _id یا slug)
  if (req.query.category) {
    const Category = require("../models/category.model").default;
    let categoryId = req.query.category as string;
    // اگر slug اومده بود، id رو پیدا کن
    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      const category = await Category.findOne({ slug: categoryId });
      if (category) categoryId = category._id;
    }
    filter.category = categoryId;
  }

  // فیلتر برند
  if (req.query.brand) {
    filter.brand = req.query.brand as string;
  }

  // فیلتر جستجو
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    filter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { shortDescription: { $regex: searchTerm, $options: "i" } },
      { tags: { $in: [new RegExp(searchTerm, "i")] } },
    ];
  }

  // فیلتر قیمت
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // فیلتر حداقل امتیاز
  if (req.query.rating) {
    filter.rating = { $gte: Number(req.query.rating) };
  }

  // فیلتر موجودی
  if (req.query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  // فیلتر تخفیف دار
  if (req.query.hasDiscount === "true") {
    filter.discountPrice = { $gt: 0 };
  }

  // ترتیب‌بندی
  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (req.query.sort) {
    case "price":
      sort = { price: 1 };
      break;
    case "-price":
      sort = { price: -1 };
      break;
    case "-soldCount":
      sort = { sold: -1 };
      break;
    case "-rating":
      sort = { rating: -1 };
      break;
    case "name":
      sort = { name: 1 };
      break;
    case "-createdAt":
    default:
      sort = { createdAt: -1 };
      break;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .populate("brand", "name logo")
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "محصولات با موفقیت دریافت شد",
    data: {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  });
});

// ==================== دریافت محصول با اسلاگ ====================
export const getProductBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isActive: true })
      .populate("brand", "name logo")
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json(apiResponse(false, "محصول یافت نشد"));
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .populate("brand", "name");

    res.json(
      apiResponse(true, "محصول با موفقیت دریافت شد", {
        product,
        relatedProducts,
      }),
    );
  },
);

// ==================== دریافت محصول با ID ====================
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("brand", "name logo");

    if (!product) {
      return res.status(404).json(apiResponse(false, "محصول یافت نشد"));
    }

    res.json(apiResponse(true, "محصول با موفقیت دریافت شد", { product }));
  },
);

// ==================== ایجاد محصول جدید ====================
export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const data = req.body;
    if (!data.name)
      return res.status(400).json(apiResponse(false, "نام محصول الزامی است"));
    if (!data.price || data.price <= 0)
      return res.status(400).json(apiResponse(false, "قیمت محصول معتبر نیست"));
    if (!data.category)
      return res
        .status(400)
        .json(apiResponse(false, "دسته‌بندی محصول الزامی است"));
    if (!data.brand)
      return res.status(400).json(apiResponse(false, "برند محصول الزامی است"));

    let slug = generateSlug(data.name);
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${generateSlug(data.name)}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      name: data.name,
      slug,
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      price: Number(data.price),
      discountPrice: Number(data.discountPrice) || 0,
      category: data.category,
      brand: data.brand,
      stock: Number(data.stock) || 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
      flavors: Array.isArray(data.flavors) ? data.flavors.filter(Boolean) : [],
      ingredients: Array.isArray(data.ingredients)
        ? data.ingredients.filter(Boolean)
        : [],
      tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
      howToUse: data.howToUse || "",
      warnings: data.warnings || "",
      specifications: {
        weight: data.specifications?.weight || "",
        servingSize: data.specifications?.servingSize || "",
        servingsPerContainer:
          Number(data.specifications?.servingsPerContainer) || 0,
        calories: Number(data.specifications?.calories) || 0,
        protein: Number(data.specifications?.protein) || 0,
        carbs: Number(data.specifications?.carbs) || 0,
        fat: Number(data.specifications?.fat) || 0,
        sugar: Number(data.specifications?.sugar) || 0,
        sodium: Number(data.specifications?.sodium) || 0,
        caffeine: Number(data.specifications?.caffeine) || 0,
        creatine: Number(data.specifications?.creatine) || 0,
        betaAlanine: Number(data.specifications?.betaAlanine) || 0,
        bcaa: Number(data.specifications?.bcaa) || 0,
        glutamine: Number(data.specifications?.glutamine) || 0,
      },
    });

    res
      .status(201)
      .json(apiResponse(true, "محصول با موفقیت ایجاد شد", { product }));
  },
);

// ==================== بروزرسانی محصول ====================
export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const updateData = req.body;
    if (updateData.name) {
      let slug = generateSlug(updateData.name);
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: req.params.id } })) {
        slug = `${generateSlug(updateData.name)}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    );
    if (!product)
      return res.status(404).json(apiResponse(false, "محصول یافت نشد"));
    res.json(apiResponse(true, "محصول با موفقیت بروزرسانی شد", { product }));
  },
);

// ==================== حذف نرم محصول ====================
export const deleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!product)
      return res.status(404).json(apiResponse(false, "محصول یافت نشد"));
    res.json(apiResponse(true, "محصول با موفقیت حذف شد"));
  },
);

// ==================== حذف فیزیکی محصول ====================
export const permanentDeleteProduct = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json(apiResponse(false, "محصول یافت نشد"));
    res.json(apiResponse(true, "محصول به طور کامل حذف شد"));
  },
);

// ==================== دریافت محصولات ویژه ====================
export const getFeaturedProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate("category", "name slug")
      .populate("brand", "name logo")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      apiResponse(true, "محصولات ویژه با موفقیت دریافت شد", {
        products: products || [],
      }),
    );
  },
);

// ==================== دریافت محصولات پرفروش ====================
export const getBestSellerProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const products = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(limit)
      .lean();
    res.json(
      apiResponse(true, "محصولات پرفروش با موفقیت دریافت شد", { products }),
    );
  },
);

// ==================== دریافت محصولات با تخفیف ====================
export const getOnSaleProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const products = await Product.find({
      isActive: true,
      discountPrice: { $gt: 0 },
    })
      .sort({ discountPrice: 1 })
      .limit(limit)
      .lean();
    res.json(
      apiResponse(true, "محصولات با تخفیف با موفقیت دریافت شد", { products }),
    );
  },
); // ==================== دریافت گزینه‌های فیلتر ====================
export const getFilterOptions = asyncHandler(
  async (req: Request, res: Response) => {
    const [brands, categories, priceRange] = await Promise.all([
      Product.distinct("brand", { isActive: true }),
      Product.distinct("category", { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ]);

    res.json(
      apiResponse(true, "گزینه‌های فیلتر با موفقیت دریافت شد", {
        brands,
        categories,
        priceRange: {
          min: priceRange[0]?.minPrice || 0,
          max: priceRange[0]?.maxPrice || 10000000,
        },
      }),
    );
  },
);

// ==================== جستجوی پیشرفته ====================
export const advancedSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = req.body;

    const filter: Record<string, any> = { isActive: true };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { shortDescription: { $regex: query, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("brand", "name logo")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json(
      apiResponse(true, "نتایج جستجو با موفقیت دریافت شد", {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      }),
    );
  },
);

// ==================== بروزرسانی موجودی محصول ====================
export const updateProductStock = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Number(stock) },
      { new: true },
    );

    if (!product) {
      return res.status(404).json(apiResponse(false, "محصول یافت نشد"));
    }

    res.json(
      apiResponse(true, "موجودی محصول با موفقیت بروزرسانی شد", {
        stock: product.stock,
        inStock: product.stock > 0,
      }),
    );
  },
);
// دریافت همه محصولات بدون هیچ فیلتری
export const getAllProductsNoFilter = asyncHandler(
  async (req: Request, res: Response) => {
    const products = await Product.find()
      .populate("category", "name slug")
      .populate("brand", "name logo");
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
  }
);