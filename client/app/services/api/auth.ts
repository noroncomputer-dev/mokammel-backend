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
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
function assertData(data: any, path: string) {
  if (!data) throw new Error(`پاسخ سرور ناقص است: ${path} وجود ندارد`);
}
const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    assertData(response.data?.data, "data");
    const { accessToken, user } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    return { user, accessToken };
  },
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    assertData(response.data?.data, "data");
    const { accessToken, user } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    return { user, accessToken };
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      // حتی اگه request خطا داد، توکن رو پاک کن
      localStorage.removeItem("accessToken");
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", { email });
  },
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axiosInstance.post("/auth/reset-password", { token, newPassword });
  },
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post("/auth/refresh");
    assertData(response.data?.data, "data");
    const { accessToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    return { accessToken };
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await axiosInstance.get("/auth/me");
    // ساختار response: { success, message, data: { user: {...} } }
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
