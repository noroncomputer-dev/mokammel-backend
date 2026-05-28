// client/app/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "@/services/api/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });

          if (response.data.success) {
            const { user } = response.data.data;
            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
          set({ isLoading: false });
          return {
            success: false,
            message: response.data.message || "خطا در ورود",
          };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "خطا در ارتباط با سرور",
          };
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/register", {
            name,
            email,
            password,
            phone: phone || undefined,
          });

          if (response.data.success) {
            const { user } = response.data.data;
            set({ user, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, message: response.data.message };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "خطا در ثبت‌نام",
          };
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, isAuthenticated: false });
          // پاک کردن localStorage هم به صورت دستی
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage");
          }
        }
      },

      // ✅ اصلاح شده - با console.log برای دیباگ
      checkAuth: async () => {
        console.log("🔍 Checking auth...");
        try {
          const response = await api.get("/auth/me");
          console.log("✅ Auth response:", response.data);

          if (response.data.success) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error: any) {
          console.error(
            "❌ checkAuth error:",
            error.response?.status,
            error.message,
          );
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/forgot-password", { email });
          set({ isLoading: false });
          return {
            success: response.data.success,
            message: response.data.message || "ایمیل بازیابی ارسال شد",
          };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "خطا در ارسال ایمیل",
          };
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/reset-password", {
            token,
            password,
          });
          set({ isLoading: false });
          return {
            success: response.data.success,
            message: response.data.message || "رمز عبور با موفقیت تغییر کرد",
          };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || "خطا در تغییر رمز عبور",
          };
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
