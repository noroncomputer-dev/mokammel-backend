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
  id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
}

function assertData(data: any, path: string) {
  if (!data) throw new Error(`پاسخ سرور ناقص است: ${path} وجود ندارد`);
}

const authService = {
  register: async (data: RegisterData): Promise<AuthUser> => {
    const response = await axiosInstance.post("/auth/register", data);
    assertData(response.data?.data, "data");
    const { user } = response.data.data;
    return user;
  },

  login: async (data: LoginData): Promise<AuthUser> => {
    const response = await axiosInstance.post("/auth/login", data);
    assertData(response.data?.data, "data");
    const { user } = response.data.data;
    return user;
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
    const user = response.data?.data?.user;
    if (!user) {
      throw new Error("اطلاعات کاربر از سرور دریافت نشد");
    }
    return user;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    return authService.getMe();
  },
};

export default authService;
