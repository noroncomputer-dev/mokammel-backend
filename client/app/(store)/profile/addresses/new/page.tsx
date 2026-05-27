"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

const provinces = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
];

export default function NewAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/users/addresses", formData);
      if (response.data.success) {
        toast.success("آدرس با موفقیت اضافه شد");
        router.push("/profile/addresses");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در افزودن آدرس");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Link
          href="/profile/addresses"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            آدرس جدید
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            اطلاعات آدرس ارسال را وارد کنید
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نام و نام خانوادگی *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              تلفن *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              استان *
            </label>
            <select
              value={formData.province}
              onChange={(e) =>
                setFormData({ ...formData, province: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">انتخاب استان</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              شهر *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            آدرس کامل *
          </label>
          <textarea
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="خیابان، پلاک، واحد ..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            کد پستی *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) =>
              setFormData({ ...formData, isDefault: e.target.checked })
            }
            className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700 dark:text-gray-300">
            این آدرس به عنوان آدرس پیش‌فرض باشد
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/profile/addresses"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            انصراف
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            ذخیره آدرس
          </button>
        </div>
      </form>
    </div>
  );
}
