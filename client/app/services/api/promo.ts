// services/api/promo.ts
import axiosInstance from "./axios";

export interface Promo {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  link: string;
  buttonText: string;
  icon: "Percent" | "Zap" | "Gift" | "Clock" | "Sparkles";
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const promosService = {
  // ==================== صفحه اصلی (عمومی) ====================
  getActivePromos: async (): Promise<Promo[]> => {
    const response = await axiosInstance.get("/promos/active");
    return response.data.data.promos;
  },

  // ==================== ادمین ====================
  // دریافت همه بنرها
  getAllPromos: async (): Promise<Promo[]> => {
    const response = await axiosInstance.get("/promos");
    return response.data.data.promos;
  },

  // دریافت بنر با آیدی
  getPromoById: async (id: string): Promise<Promo> => {
    const response = await axiosInstance.get(`/promos/${id}`);
    return response.data.data.promo;
  },

  // ایجاد بنر جدید
  createPromo: async (
    data: Omit<Promo, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Promo> => {
    const response = await axiosInstance.post("/promos", data);
    return response.data.data.promo;
  },

  // بروزرسانی بنر
  updatePromo: async (id: string, data: Partial<Promo>): Promise<Promo> => {
    const response = await axiosInstance.put(`/promos/${id}`, data);
    return response.data.data.promo;
  },

  // حذف بنر
  deletePromo: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/promos/${id}`);
  },

  // حذف چند بنر
  deleteManyPromos: async (ids: string[]): Promise<void> => {
    await axiosInstance.post("/promos/delete-many", { ids });
  },
};

export default promosService;
