// services/api/reviews.ts
import axiosInstance from "./axios";

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  likes: string[];
  dislikes: string[];
  isApproved: boolean;
  adminReply?: {
    comment: string;
    createdAt: string;
    adminName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  avgRating: number;
  total: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const reviewService = {
  // دریافت نظرات یک محصول
  getProductReviews: async (
    productId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number,
  ): Promise<ReviewsResponse> => {
    const params: any = { page, limit };
    if (rating) params.rating = rating;

    const response = await axiosInstance.get(`/reviews/product/${productId}`, {
      params,
    });
    return response.data.data;
  },

  // ثبت نظر جدید
  createOrUpdateReview: async (data: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<Review> => {
    const response = await axiosInstance.post("/reviews", data);
    return response.data.data.review;
  },

  // لایک/دیسلایک نظر
  likeReview: async (
    reviewId: string,
    action: "like" | "dislike",
  ): Promise<{ likes: number; dislikes: number }> => {
    const response = await axiosInstance.post(`/reviews/${reviewId}/like`, {
      action,
    });
    return response.data.data;
  },

  // مدیریت نظرات (ادمین)
  getAllReviews: async (status?: string, page: number = 1): Promise<any> => {
    try {
      const response = await axiosInstance.get("/reviews/admin/all", {
        params: { status, page, limit: 20 },
      });
      return response.data.data;
    } catch (error: any) {
      console.error(
        "❌ getAllReviews error:",
        error.response?.status,
        error.response?.data,
      );
      throw error;
    }
  },

  approveReview: async (reviewId: string): Promise<Review> => {
    const response = await axiosInstance.put(`/reviews/${reviewId}/approve`);
    return response.data.data.review;
  },

  replyToReview: async (reviewId: string, comment: string): Promise<Review> => {
    const response = await axiosInstance.post(`/reviews/${reviewId}/reply`, {
      comment,
    });
    return response.data.data.review;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await axiosInstance.delete(`/reviews/${reviewId}`);
  },
};

export default reviewService;
