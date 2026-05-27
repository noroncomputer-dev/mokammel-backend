"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Loader2,
  Store,
  Mail,
  Shield,
  Bell,
  Sparkles,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo: string;
  minOrderAmount: number;
  shippingCost: number;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
}

const defaultSettings: Settings = {
  storeName: "مکمل‌شاپ",
  storeEmail: "",
  storePhone: "",
  storeAddress: "",
  storeLogo: "",
  minOrderAmount: 0,
  shippingCost: 0,
  freeShippingThreshold: 0,
  maintenanceMode: false,
  allowGuestCheckout: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/settings");
      if (response.data.success && response.data.data) {
        setSettings({ ...defaultSettings, ...response.data.data });
      } else {
        // استفاده از تنظیمات پیش‌فرض
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      // در صورت خطا، از تنظیمات پیش‌فرض استفاده کن
      setSettings(defaultSettings);

      // فقط اگر خطای 401 نبود، خطا را نمایش بده
      if (error.response?.status !== 401) {
        setError("خطا در دریافت تنظیمات. از تنظیمات پیش‌فرض استفاده می‌شود.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put("/settings", settings);
      if (response.data.success) {
        setSuccess("تنظیمات با موفقیت ذخیره شد");
        toast.success("تنظیمات با موفقیت ذخیره شد");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "خطا در ذخیره تنظیمات");
      }
    } catch (err: any) {
      console.error("Error saving settings:", err);

      let errorMessage = "خطا در ذخیره تنظیمات";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 400) {
        errorMessage =
          "داده‌های ارسالی معتبر نیستند. لطفاً مقادیر را بررسی کنید.";
      } else if (err.response?.status === 401) {
        errorMessage = "لطفاً دوباره وارد حساب خود شوید";
      } else if (err.response?.status === 403) {
        errorMessage = "شما دسترسی لازم برای این عملیات را ندارید";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // ==================== استایل‌های طلایی ====================
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition-colors";
  const textareaClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm resize-vertical";
  const checkboxClass =
    "w-4 h-4 rounded border-border text-primary focus:ring-primary/30 focus:ring-offset-0 bg-muted/50 transition-all duration-200";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
        <span className="mr-3 text-muted-foreground">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            مدیریت فروشگاه
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold gold-text">
          تنظیمات فروشگاه
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          مدیریت تنظیمات کلی فروشگاه
        </p>
      </div>

      {/* ==================== پیام‌های موفقیت و خطا ==================== */}
      {success && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ==================== اطلاعات فروشگاه ==================== */}
        <div className="card-luxury p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
            <Store className="h-5 w-5 text-primary" />
            اطلاعات فروشگاه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>نام فروشگاه</label>
              <input
                type="text"
                value={settings.storeName || ""}
                onChange={(e) =>
                  setSettings({ ...settings, storeName: e.target.value })
                }
                className={inputClass}
                placeholder="مثال: مکمل‌شاپ"
              />
            </div>
            <div>
              <label className={labelClass}>ایمیل فروشگاه</label>
              <input
                type="email"
                value={settings.storeEmail || ""}
                onChange={(e) =>
                  setSettings({ ...settings, storeEmail: e.target.value })
                }
                className={inputClass}
                placeholder="info@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>تلفن فروشگاه</label>
              <input
                type="tel"
                value={settings.storePhone || ""}
                onChange={(e) =>
                  setSettings({ ...settings, storePhone: e.target.value })
                }
                className={inputClass}
                placeholder="۰۲۱-۱۲۳۴۵۶۷۸"
              />
            </div>
            <div>
              <label className={labelClass}>لوگو (آدرس)</label>
              <input
                type="text"
                value={settings.storeLogo || ""}
                onChange={(e) =>
                  setSettings({ ...settings, storeLogo: e.target.value })
                }
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>آدرس فروشگاه</label>
              <textarea
                value={settings.storeAddress || ""}
                onChange={(e) =>
                  setSettings({ ...settings, storeAddress: e.target.value })
                }
                rows={2}
                className={textareaClass}
                placeholder="آدرس کامل فروشگاه..."
              />
            </div>
          </div>
        </div>

        {/* ==================== تنظیمات عمومی ==================== */}
        <div className="card-luxury p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
            <Shield className="h-5 w-5 text-primary" />
            تنظیمات عمومی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>حداقل مبلغ سفارش (تومان)</label>
              <input
                type="number"
                value={settings.minOrderAmount || 0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minOrderAmount: Number(e.target.value),
                  })
                }
                className={inputClass}
                placeholder="۰"
              />
            </div>
            <div>
              <label className={labelClass}>هزینه ارسال (تومان)</label>
              <input
                type="number"
                value={settings.shippingCost || 0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shippingCost: Number(e.target.value),
                  })
                }
                className={inputClass}
                placeholder="۰"
              />
            </div>
            <div>
              <label className={labelClass}>ارسال رایگان از مبلغ (تومان)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold || 0}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className={inputClass}
                placeholder="۰"
              />
            </div>
          </div>
        </div>

        {/* ==================== تنظیمات حالت ==================== */}
        <div className="card-luxury p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
            <Bell className="h-5 w-5 text-primary" />
            حالت‌ها
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.maintenanceMode || false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className={checkboxClass}
              />
              <span className="text-sm text-foreground/70 group-hover:text-foreground transition">
                حالت تعمیرات (فقط ادمین می‌تواند وارد شود)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.allowGuestCheckout !== false}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowGuestCheckout: e.target.checked,
                  })
                }
                className={checkboxClass}
              />
              <span className="text-sm text-foreground/70 group-hover:text-foreground transition">
                سبد خرید مهمان (بدون ثبت نام)
              </span>
            </label>
          </div>
        </div>

        {/* ==================== دکمه ذخیره طلایی ==================== */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-gold px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </button>
        </div>
      </form>
    </div>
  );
}
