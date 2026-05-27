// app/store/theme.store.ts
//
// ⚠️  next-themes (ThemeProvider در layout.tsx) مدیریت dark class روی <html>
// را کامل انجام می‌دهد. این store فقط برای کامپوننت‌هایی که به مقدار theme
// نیاز دارند (بدون useTheme hook) نگه داشته می‌شود.
// دستکاری مستقیم classList حذف شد تا با next-themes تداخل نداشته باشد.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
