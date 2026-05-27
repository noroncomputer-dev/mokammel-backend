// services/api/brands.ts
import axiosInstance from "./axios";

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  origin?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandsResponse {
  brands: Brand[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const brandService = {
  // دریافت همه برندها
  getBrands: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<BrandsResponse> => {
    const response = await axiosInstance.get("/brands", { params });

    if (response.data?.data?.brands) {
      return {
        brands: response.data.data.brands,
        pagination: response.data.data.pagination,
      };
    }
    if (response.data?.brands) {
      return {
        brands: response.data.brands,
        pagination: response.data.pagination,
      };
    }
    if (Array.isArray(response.data)) {
      return { brands: response.data };
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return { brands: response.data.data };
    }
    return { brands: [] };
  },

  // دریافت یک برند با slug
  getBrandBySlug: async (slug: string): Promise<Brand | null> => {
    const response = await axiosInstance.get(`/brands/slug/${slug}`);
    if (response.data?.data?.brand) {
      return response.data.data.brand;
    }
    if (response.data?.brand) {
      return response.data.brand;
    }
    return response.data?.data || null;
  },

  // دریافت یک برند با ID
  getBrandById: async (id: string): Promise<Brand | null> => {
    const response = await axiosInstance.get(`/brands/${id}`);
    if (response.data?.data?.brand) {
      return response.data.data.brand;
    }
    if (response.data?.brand) {
      return response.data.brand;
    }
    return response.data?.data || null;
  },

  // ✅ ایجاد برند جدید (فقط ادمین)
  createBrand: async (data: Partial<Brand>): Promise<Brand> => {
    const response = await axiosInstance.post("/brands", data);
    return response.data?.data?.brand || response.data?.data || response.data;
  },

  // ✅ بروزرسانی برند (فقط ادمین) - اضافه شد
  updateBrand: async (id: string, data: Partial<Brand>): Promise<Brand> => {
    const response = await axiosInstance.put(`/brands/${id}`, data);
    return response.data?.data?.brand || response.data?.data || response.data;
  },

  // ✅ حذف برند (فقط ادمین)
  deleteBrand: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/brands/${id}`);
  },

  // دریافت برندهای فعال (برای صفحه اصلی)
  getActiveBrands: async (limit?: number): Promise<Brand[]> => {
    try {
      const response = await axiosInstance.get("/brands/active", {
        params: limit ? { limit } : {},
      });

      if (response.data?.data?.brands) {
        return response.data.data.brands;
      }
      if (response.data?.brands) {
        return response.data.brands;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching active brands:", error);
      return [];
    }
  },
};

export default brandService;
