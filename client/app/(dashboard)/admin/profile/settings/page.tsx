"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Sparkles,
  Bell,
  Shield,
  Moon,
  Sun,
  Mail,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    darkMode: false,
  });

  useEffect(() => {
    // ابتدا تنظیمات dark mode را از localStorage بخوان
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      const isDark = JSON.parse(savedDarkMode);
      setSettings((prev) => ({ ...prev, darkMode: isDark }));
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/users/settings");
      if (response.data.success && response.data.data) {
        setSettings((prev) => ({ ...prev, ...response.data.data }));
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      // اگر API وجود نداشت، از تنظیمات پیش‌فرض استفاده کن
      // خطا را به کاربر نشان نده، فقط لاگ کن
      if (error.response?.status === 404) {
        console.log("Settings API not found, using default settings");
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // فقط تنظیماتی که تغییر کرده‌اند را ارسال کن
      const dataToSend = {
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        twoFactorAuth: settings.twoFactorAuth,
        darkMode: settings.darkMode,
      };

      const response = await api.put("/users/settings", dataToSend);
      if (response.data.success) {
        toast.success("تنظیمات با موفقیت ذخیره شد");

        // اعمال دارک مود
        if (settings.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }

        // ذخیره در localStorage
        localStorage.setItem("darkMode", JSON.stringify(settings.darkMode));
      }
    } catch (error: any) {
      console.error("Error details:", error.response?.data);

      // نمایش پیام خطای دقیق از سرور
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "خطا در ذخیره تنظیمات";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkboxClass =
    "w-4 h-4 rounded border-border text-primary focus:ring-primary/30 focus:ring-offset-0 bg-muted/50 transition-all duration-200";

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر */}
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            تنظیمات حساب
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold gold-text">
          تنظیمات حساب
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت تنظیمات اعلانات و حریم خصوصی
        </p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="card-luxury p-6 space-y-5">
          <h2 className="text-lg font-bold gold-text flex items-center gap-2">
            <Bell className="h-5 w-5" />
            اعلانات
          </h2>

          <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-muted/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  اعلانات ایمیلی
                </span>
                <p className="text-[10px] text-muted-foreground">
                  دریافت اعلانات از طریق ایمیل
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  emailNotifications: e.target.checked,
                })
              }
              className={checkboxClass}
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-muted/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  اعلانات پیامکی
                </span>
                <p className="text-[10px] text-muted-foreground">
                  دریافت اعلانات از طریق پیامک
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) =>
                setSettings({ ...settings, smsNotifications: e.target.checked })
              }
              className={checkboxClass}
            />
          </label>

          <div className="border-t border-border my-4" />

          <h2 className="text-lg font-bold gold-text flex items-center gap-2">
            <Shield className="h-5 w-5" />
            امنیت
          </h2>

          <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-muted/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  ورود دو مرحله‌ای
                </span>
                <p className="text-[10px] text-muted-foreground">
                  افزایش امنیت حساب با کد تأیید
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) =>
                setSettings({ ...settings, twoFactorAuth: e.target.checked })
              }
              className={checkboxClass}
            />
          </label>

          <div className="border-t border-border my-4" />

          <h2 className="text-lg font-bold gold-text flex items-center gap-2">
            {settings.darkMode ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            ظاهر
          </h2>

          <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-muted/30 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {settings.darkMode ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">
                  حالت تاریک
                </span>
                <p className="text-[10px] text-muted-foreground">
                  نمایش سایت در حالت تاریک
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) =>
                setSettings({ ...settings, darkMode: e.target.checked })
              }
              className={checkboxClass}
            />
          </label>

          <div className="flex gap-3 justify-end pt-4">
            <Link
              href="/admin/profile"
              className="btn-gold-outline px-5 py-2 text-sm font-medium"
            >
              بازگشت
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold px-5 py-2 text-sm font-bold flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
