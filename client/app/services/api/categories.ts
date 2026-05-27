// client/app/services/api/categories.ts

import axiosInstance from "./axios";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface CategoriesResponse {
  categories: Category[];
}

const categoryService = {
  // دریافت همه دسته‌بندی‌ها
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await axiosInstance.get("/categories");
    return response.data.data;
  },

  // دریافت دسته‌بندی‌های فعال (برای صفحه اصلی)
  getActiveCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get("/categories/active");
    return response.data.data.categories;
  },

  // دریافت یک دسته‌بندی با slug
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axiosInstance.get(`/categories/${slug}`);
    return response.data.data.category;
  },

  // ایجاد دسته‌بندی جدید (فقط ادمین)
  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await axiosInstance.post("/categories", data);
    return response.data.data.category;
  },

  // بروزرسانی دسته‌بندی (فقط ادمین)
  updateCategory: async (
    id: string,
    data: Partial<Category>,
  ): Promise<Category> => {
    const response = await axiosInstance.put(`/categories/${id}`, data);
    return response.data.data.category;
  },

  // حذف دسته‌بندی (فقط ادمین)
  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
  },
};

export default categoryService;
