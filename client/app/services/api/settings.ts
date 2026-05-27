import axiosInstance from "./axios";

export interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo: string;
  metaDescription: string;
  metaKeywords: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  minOrderAmount: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

const settingsService = {
  // دریافت تنظیمات
  getSettings: async (): Promise<Settings> => {
    const response = await axiosInstance.get("/settings");
    return response.data.data;
  },

  // بروزرسانی تنظیمات
  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    const response = await axiosInstance.put("/settings", data);
    return response.data.data;
  },
};

export default settingsService;
