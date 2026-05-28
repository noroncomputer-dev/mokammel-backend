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
  // پرچم برای جلوگیری از اجرای چندباره checkAuth که باعث ریلود/حلقه می‌شد
  authChecked: boolean;
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

/**
 * هِلپر برای ست کردن یک کوکی client-side با نام accessToken
 * این کوکی فقط برای middleware (که cookie-based است) لازم است
 * تا middleware بفهمد کاربر لاگین است یا نه.
 *
 * توکن واقعی JWT اگر در بک‌اند به صورت httpOnly ست شود، آنجا امن است.
 * این کوکی فقط یک "flag" است که می‌گوید کاربر authenticated است.
 */
const AUTH_COOKIE_NAME = "accessToken";

function setAuthCookie(value: string, days = 7) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authChecked: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });

          if (response.data.success) {
            const { user, accessToken } = response.data.data;
            // ست کردن کوکی برای middleware
            if (accessToken) {
              setAuthCookie(accessToken);
            } else {
              // اگر بک‌اند توکن را httpOnly ست می‌کند، حداقل یک flag بگذاریم
              setAuthCookie("1");
            }
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              authChecked: true,
            });
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
            const { user, accessToken } = response.data.data;
            if (accessToken) {
              setAuthCookie(accessToken);
            } else {
              setAuthCookie("1");
            }
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              authChecked: true,
            });
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
          clearAuthCookie();
          set({
            user: null,
            isAuthenticated: false,
            authChecked: true,
          });
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage");
            localStorage.removeItem("accessToken");
          }
        }
      },

      checkAuth: async () => {
        // ⚠️ از اجرای دوباره جلوگیری می‌کنیم تا حلقه/بلینک ایجاد نشود
        const state = get();
        if (state.authChecked || state.isLoading) {
          return;
        }

        // ⚠️ isLoading را اینجا true نمی‌کنیم تا کل UI بلاک نشود
        // فقط در پس‌زمینه چک می‌کنیم
        try {
          const response = await api.get("/auth/me");

          if (response.data.success) {
            const user = response.data.data.user;
            // مطمئن شو که کوکی هم set شده تا middleware با state همخوان باشد
            setAuthCookie("1");
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              authChecked: true,
            });
          } else {
            clearAuthCookie();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              authChecked: true,
            });
          }
        } catch (error: any) {
          // اگر 401 یا هر خطای دیگه‌ای آمد، فقط state را پاک کن
          // ❌ ریدایرکت نکن! اگر کاربر در صفحه عمومی است نباید به /login بره
          clearAuthCookie();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authChecked: true,
          });
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
