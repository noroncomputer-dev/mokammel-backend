import { Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Review from "../models/review.model";
import Product from "../models/product.model";
import Order from "../models/order.model";
import { AuthRequest } from "../middleware/auth.middleware";

// ==================== دریافت نظرات یک محصول ====================
export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    // ✅ اصلاح: تبدیل صریح به string
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;

    const { page = 1, limit = 10, rating } = req.query;

    const filter: any = { product: productId, isApproved: true };
    if (rating) filter.rating = Number(rating);

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [reviews, total, stats] = await Promise.all([
      Review.find(filter)
        .populate("user", "name avatar")
        .populate("adminReply.admin", "name")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        {
          $match: {
            product: new mongoose.Types.ObjectId(productId),
            isApproved: true,
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            total: { $sum: 1 },
            rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const reviewStats = stats[0] || {
      avgRating: 0,
      total: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    res.json(
      apiResponse(true, "نظرات با موفقیت دریافت شد", {
        reviews,
        stats: reviewStats,
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

// ==================== ایجاد یا بروزرسانی نظر ====================
export const createOrUpdateReview = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?._id;

    if (!userId) {
      res.status(401).json(apiResponse(false, "لطفاً وارد حساب کاربری شوید"));
      return;
    }

    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json(apiResponse(false, "فیلدهای الزامی را پر کنید"));
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json(apiResponse(false, "محصول یافت نشد"));
      return;
    }

    const hasPurchased = await Order.findOne({
      user: userId,
      "items.productId": productId,
      paymentStatus: "paid",
    });

    let review = await Review.findOne({ product: productId, user: userId });
    let isUpdate = false;

    if (review) {
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      review.isApproved = false;
      await review.save();
      isUpdate = true;
    } else {
      review = await Review.create({
        product: productId,
        user: userId,
        rating,
        title,
        comment,
        isVerifiedPurchase: !!hasPurchased,
      });
    }

    const approvedReviews = await Review.find({
      product: productId,
      isApproved: true,
    });
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
          approvedReviews.length
        : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewCount: approvedReviews.length,
    });

    res
      .status(isUpdate ? 200 : 201)
      .json(
        apiResponse(
          true,
          isUpdate ? "نظر با موفقیت بروزرسانی شد" : "نظر با موفقیت ثبت شد",
          { review },
        ),
      );
  },
);

// ==================== لایک/دیسلایک نظر ====================
export const likeReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { reviewId } = req.params;
    const { action } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json(apiResponse(false, "لطفاً وارد حساب کاربری شوید"));
      return;
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json(apiResponse(false, "نظر یافت نشد"));
      return;
    }

    const userIdStr = userId.toString();
    const userObjectId = new mongoose.Types.ObjectId(userIdStr);

    if (action === "like") {
      review.dislikes = review.dislikes.filter(
        (id) => id.toString() !== userIdStr,
      );
      const alreadyLiked = review.likes.some(
        (id) => id.toString() === userIdStr,
      );
      if (alreadyLiked) {
        review.likes = review.likes.filter((id) => id.toString() !== userIdStr);
      } else {
        review.likes.push(userObjectId);
      }
    } else if (action === "dislike") {
      review.likes = review.likes.filter((id) => id.toString() !== userIdStr);
      const alreadyDisliked = review.dislikes.some(
        (id) => id.toString() === userIdStr,
      );
      if (alreadyDisliked) {
        review.dislikes = review.dislikes.filter(
          (id) => id.toString() !== userIdStr,
        );
      } else {
        review.dislikes.push(userObjectId);
      }
    } else {
      res.status(400).json(apiResponse(false, "عملیات نامعتبر است"));
      return;
    }

    await review.save();

    res.json(
      apiResponse(true, "عملیات با موفقیت انجام شد", {
        likes: review.likes.length,
        dislikes: review.dislikes.length,
      }),
    );
  },
);

// ==================== پاسخ ادمین به نظر ====================
export const adminReplyToReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        adminReply: {
          comment,
          createdAt: new Date(),
          adminName: req.user?.name || "ادمین",
        },
      },
      { new: true },
    );

    if (!review) {
      res.status(404).json(apiResponse(false, "نظر یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "پاسخ با موفقیت ثبت شد", { review }));
  },
);

// ==================== دریافت همه نظرات (ادمین) ====================
export const getAllReviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, status = "pending", productId } = req.query;

    const filter: any = {};
    if (status === "pending") filter.isApproved = false;
    if (status === "approved") filter.isApproved = true;
    if (productId) filter.product = productId;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate("user", "name email")
        .populate("product", "name images slug")
        .sort("-createdAt")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json(
      apiResponse(true, "نظرات با موفقیت دریافت شد", {
        reviews,
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

// ==================== تأیید نظر (ادمین) ====================
export const approveReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved: true },
      { new: true },
    );

    if (!review) {
      res.status(404).json(apiResponse(false, "نظر یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "نظر با موفقیت تأیید شد", { review }));
  },
);

// ==================== حذف نظر ====================
export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const review = await Review.findByIdAndDelete(req.params.reviewId);

    if (!review) {
      res.status(404).json(apiResponse(false, "نظر یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "نظر با موفقیت حذف شد"));
  },
);
