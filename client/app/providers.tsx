// app/providers.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const didRunRef = useRef(false);

  useEffect(() => {
    // فقط یک بار در طول عمر اپ اجرا شود تا از حلقه ریلود جلوگیری شود
    if (didRunRef.current) return;
    didRunRef.current = true;
    checkAuth();
  }, [checkAuth]);

  // ❌ قبلاً اینجا اگر isLoading=true بود کل UI با spinner جایگزین می‌شد
  // این کار باعث می‌شد به محض هر بار mount شدن (مثلا بعد از login) کل صفحه
  // ناپدید و دوباره ظاهر شود = حس "ریلود شدن صفحه".
  // الان بک‌گراند چک می‌کنیم و UI را block نمی‌کنیم.
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
}
