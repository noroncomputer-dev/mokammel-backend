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

// ست کردن کوکی auth در سمت کلاینت تا middleware بتواند آن را ببیند
function setAuthCookie(value: string, days = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `accessToken=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
}

const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    assertData(response.data?.data, "data");
    const { accessToken, user } = response.data.data;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
    }
    // ست کردن کوکی برای middleware
    setAuthCookie(accessToken || "1");
    return { user, accessToken };
  },
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    assertData(response.data?.data, "data");
    const { accessToken, user } = response.data.data;
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
    }
    // ست کردن کوکی برای middleware
    setAuthCookie(accessToken || "1");
    return { user, accessToken };
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      // حتی اگه request خطا داد، توکن رو پاک کن
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      clearAuthCookie();
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
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
    }
    setAuthCookie(accessToken || "1");
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
