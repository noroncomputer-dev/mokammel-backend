// client/app/services/api/auth.ts

import axiosInstance from "./axios";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
}

// ❌ حذف: دیگر نیازی به accessToken در localStorage نیست
// ✅ فقط از کوکی استفاده می‌کنیم

const authService = {
  register: async (data: RegisterData): Promise<AuthUser> => {
    const response = await axiosInstance.post("/auth/register", data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || "خطا در ثبت‌نام");
    }
    return response.data.data.user;
  },

  login: async (data: LoginData): Promise<AuthUser> => {
    const response = await axiosInstance.post("/auth/login", data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || "خطا در ورود");
    }
    return response.data.data.user;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axiosInstance.post("/auth/reset-password", { token, newPassword });
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await axiosInstance.get("/auth/me");
    if (!response.data?.success) {
      throw new Error(response.data?.message || "احراز هویت ناموفق");
    }
    return response.data.data.user;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    return authService.getMe();
  },
};

export default authService;
