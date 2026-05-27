// client/src/app/services/api/coupons.ts

import axiosInstance from "./axios";

export interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponData {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt: string;
}

export interface ApplyCouponResponse {
  coupon: {
    code: string;
    type: string;
    value: number;
  };
  discountAmount: number;
  finalPrice: number;
}

// ✅ تایپ برای پاسخ pagination
export interface CouponsPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ✅ تایپ برای پاسخ getAllCoupons
export interface GetAllCouponsResponse {
  coupons: Coupon[];
  pagination: CouponsPagination;
}

const couponService = {
  applyCoupon: async (
    code: string,
    totalPrice: number,
  ): Promise<ApplyCouponResponse> => {
    const response = await axiosInstance.post("/coupons/apply", {
      code,
      totalPrice,
    });
    return response.data.data;
  },

  // ✅ تایپ درست شده
  getAllCoupons: async (
    page: number = 1,
    limit: number = 20,
    isActive?: boolean,
  ): Promise<GetAllCouponsResponse> => {
    let url = `/coupons?page=${page}&limit=${limit}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  getCouponById: async (id: string): Promise<Coupon> => {
    const response = await axiosInstance.get(`/coupons/${id}`);
    return response.data.data.coupon;
  },

  createCoupon: async (data: CreateCouponData): Promise<Coupon> => {
    const response = await axiosInstance.post("/coupons", data);
    return response.data.data.coupon;
  },

  updateCoupon: async (
    id: string,
    data: Partial<CreateCouponData>,
  ): Promise<Coupon> => {
    const response = await axiosInstance.put(`/coupons/${id}`, data);
    return response.data.data.coupon;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/coupons/${id}`);
  },
};

export default couponService;
