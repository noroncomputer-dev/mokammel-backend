"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Loader2,
  Store,
  Mail,
  Shield,
  Bell,
  Palette,
} from "lucide-react";
import api from "../../../services/api/axios";

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo?: string;
  metaDescription: string;
  metaKeywords: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  minOrderAmount: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    storeLogo: "",
    metaDescription: "",
    metaKeywords: "",
    maintenanceMode: false,
    allowGuestCheckout: true,
    minOrderAmount: 0,
    shippingCost: 0,
    freeShippingThreshold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      const data = res.data?.data || res.data;
      if (data) setSettings((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put("/settings", settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          تنظیمات فروشگاه
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          مدیریت تنظیمات کلی فروشگاه
        </p>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
          تنظیمات با موفقیت ذخیره شد!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات فروشگاه */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Store className="h-5 w-5" />
            اطلاعات فروشگاه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>نام فروشگاه</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) =>
                  setSettings({ ...settings, storeName: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ایمیل فروشگاه</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) =>
                  setSettings({ ...settings, storeEmail: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>تلفن فروشگاه</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) =>
                  setSettings({ ...settings, storePhone: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>لوگو (آدرس)</label>
              <input
                type="text"
                value={settings.storeLogo}
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
                value={settings.storeAddress}
                onChange={(e) =>
                  setSettings({ ...settings, storeAddress: e.target.value })
                }
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* سئو */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            تنظیمات سئو
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>توضیحات متا</label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) =>
                  setSettings({ ...settings, metaDescription: e.target.value })
                }
                rows={2}
                className={inputClass}
                placeholder="توضیحات برای موتورهای جستجو"
              />
            </div>
            <div>
              <label className={labelClass}>کلمات کلیدی متا</label>
              <input
                type="text"
                value={settings.metaKeywords}
                onChange={(e) =>
                  setSettings({ ...settings, metaKeywords: e.target.value })
                }
                className={inputClass}
                placeholder="واژه1، واژه2، واژه3"
              />
            </div>
          </div>
        </div>

        {/* تنظیمات حمل و نقل */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            تنظیمات حمل و نقل
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>حداقل مبلغ سفارش (تومان)</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minOrderAmount: Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>هزینه ارسال (تومان)</label>
              <input
                type="number"
                value={settings.shippingCost}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shippingCost: Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>ارسال رایگان از مبلغ (تومان)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold: Number(e.target.value),
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* تنظیمات عمومی */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            تنظیمات عمومی
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span>حالت تعمیرات (فقط ادمین می‌تواند وارد شود)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowGuestCheckout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowGuestCheckout: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span>سبد خرید مهمان (بدون ثبت نام)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
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
