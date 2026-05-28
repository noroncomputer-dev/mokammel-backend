// services/api/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// مسیرهایی که نباید برایشان retry/refresh انجام شود
// تا از حلقه‌ی بی‌نهایت ریفرش‌توکن جلوگیری شود
const NO_RETRY_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/me", // مهم: /auth/me نباید باعث ریدایرکت به /login شود
];

// مسیرهایی که نیاز به ریدایرکت اجباری بعد از 401 نهایی دارند
function shouldRedirectToLogin(pathname: string): boolean {
  // فقط در صفحات محافظت‌شده ریدایرکت کن
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/orders",
    "/addresses",
    "/wishlist",
    "/checkout",
  ];
  return protectedRoutes.some((r) => pathname.startsWith(r));
}

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ فقط برای FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || "";

    // اگر 401 آمد و قبلاً retry نکرده بود و این یک مسیر no-retry نیست
    const isNoRetryPath = NO_RETRY_PATHS.some((p) => requestUrl.includes(p));

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRetryPath
    ) {
      originalRequest._retry = true;

      try {
        // رفرش توکن
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // ⚠️ به جای ریدایرکت اجباری روی هر صفحه‌ای، فقط در صفحات
        // محافظت‌شده ریدایرکت کن. روی login/register/home ریدایرکت ممنوع
        // چون باعث حلقه‌ی ریلود می‌شود.
        if (typeof window !== "undefined") {
          // پاک کردن کوکی auth
          document.cookie =
            "accessToken=; path=/; max-age=0; SameSite=Lax";
          const currentPath = window.location.pathname;
          if (shouldRedirectToLogin(currentPath)) {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
