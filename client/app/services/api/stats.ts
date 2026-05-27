// services/api/stats.ts
import axiosInstance from "./axios";

export interface HomeStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  avgRating: number;
  shippingTime: number;
}

const statsService = {
  // دریافت آمار صفحه اصلی
  getHomeStats: async (): Promise<HomeStats> => {
    try {
      const response = await axiosInstance.get("/stats/home");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching home stats:", error);
      // بازگرداندن مقادیر پیش‌فرض در صورت خطا
      return {
        totalUsers: 15000,
        totalProducts: 850,
        totalOrders: 12000,
        totalSales: 500000000,
        avgRating: 4.9,
        shippingTime: 24,
      };
    }
  },
};

export default statsService;
