import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Post, { IPost } from "../models/post.model";
import mongoose from "mongoose";

type PostLean = Omit<IPost, keyof mongoose.Document> & {
  _id: mongoose.Types.ObjectId;
  category: "nutrition" | "training" | "supplements" | "lifestyle";
};

const validCategories = [
  "nutrition",
  "training",
  "supplements",
  "lifestyle",
] as const;

type ValidCategory = (typeof validCategories)[number];

const isValidCategory = (val: string): val is ValidCategory =>
  (validCategories as readonly string[]).includes(val);

export const getPublishedPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PostLean[]>(),
      Post.countDocuments({ isPublished: true }),
    ]);

    res.json(
      apiResponse(true, "مقالات با موفقیت دریافت شد", {
        posts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      }),
    );
  },
);

export const getPostBySlug = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    const post = await Post.findOne({
      slug,
      isPublished: true,
    }).lean<PostLean>();

    if (!post) {
      res.status(404).json(apiResponse(false, "مقاله یافت نشد"));
      return;
    }

    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    res.json(apiResponse(true, "مقاله با موفقیت دریافت شد", { post }));
  },
);

export const getRelatedPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const category = req.query.category as string;
    const currentId = req.query.currentId as string;

    if (!category) {
      res.json(apiResponse(true, "مقالات مرتبط", { posts: [] }));
      return;
    }

    // ✅ اصلاح خط 118 - تبدیل id به string
    let excludeId: mongoose.Types.ObjectId;
    if (currentId && mongoose.isValidObjectId(currentId)) {
      excludeId = new mongoose.Types.ObjectId(currentId);
    } else {
      excludeId = new mongoose.Types.ObjectId();
    }

    const posts = await Post.find({
      category: category as ValidCategory,
      _id: { $ne: excludeId },
      isPublished: true,
    })
      .limit(3)
      .lean<PostLean[]>();

    res.json(apiResponse(true, "مقالات مرتبط با موفقیت دریافت شد", { posts }));
  },
);

export const getPostsByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = req.params.category;
    const page = Number(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    // ✅ اصلاح خط 110 - تبدیل به string
    const categoryStr = Array.isArray(category) ? category[0] : category;

    if (!isValidCategory(categoryStr)) {
      res.status(400).json(apiResponse(false, "دسته‌بندی نامعتبر است"));
      return;
    }

    const [posts, total] = await Promise.all([
      Post.find({ category: categoryStr, isPublished: true })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PostLean[]>(),
      Post.countDocuments({ category: categoryStr, isPublished: true }),
    ]);

    res.json(
      apiResponse(true, "مقالات با موفقیت دریافت شد", {
        posts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      }),
    );
  },
);

export const searchPosts = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query.q as string;

  if (!q || typeof q !== "string") {
    res.json(apiResponse(true, "نتیجه جستجو", { posts: [] }));
    return;
  }

  const posts = await Post.find({
    isPublished: true,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
      { excerpt: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ],
  })
    .limit(10)
    .lean<PostLean[]>();

  res.json(apiResponse(true, "نتیجه جستجو", { posts }));
});
