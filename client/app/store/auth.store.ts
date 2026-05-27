// store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        try {
          const response = await api.post("/auth/login", { email, password });

          if (response.data.success) {
            const { user } = response.data.data;
            set({ user, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ user: null, isAuthenticated: false });
          window.location.href = "/login";
        }
      },

      checkAuth: async () => {
        try {
          const response = await api.get("/auth/me");
          if (response.data.success) {
            set({ user: response.data.data.user, isAuthenticated: true });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
