// services/api/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // ✅ برای ارسال کوکی
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - بدون نیاز به Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ دیگر نیازی به اضافه کردن Authorization نیست
    // توکن در کوکی است و با withCredentials: true ارسال می‌شود

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // رفرش توکن - کوکی به صورت خودکار ارسال می‌شود
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") { window.location.href = "/login"; }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
