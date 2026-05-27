"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  MessageCircle,
  LogOut,
  Edit,
  Save,
  X,
  Loader2,
  Camera,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/services/api/axios";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put("/users/profile", {
        name: formData.name,
        phone: formData.phone,
      });
      if (response.data.success) {
        updateUser({ name: formData.name, phone: formData.phone });
        toast.success("اطلاعات با موفقیت بروزرسانی شد");
        setEditMode(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در بروزرسانی اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // اعتبارسنجی
    if (!file.type.startsWith("image/")) {
      toast.error("فایل انتخابی باید تصویر باشد");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم تصویر نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      // آپلود به سرور
      const uploadRes = await api.post("/upload", fd);
      const avatarUrl = uploadRes.data.data?.url;

      if (avatarUrl) {
        // ذخیره آدرس در پروفایل کاربر
        const updateRes = await api.put("/users/avatar", { avatarUrl });
        if (updateRes.data.success) {
          updateUser({ avatar: avatarUrl });
          setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
          toast.success("عکس پروفایل با موفقیت آپدیت شد");
        }
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("خطا در آپلود عکس");
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          حساب کاربری
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          مدیریت اطلاعات شخصی و سفارشات
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* سمت راست - اطلاعات کاربر */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center text-center">
              {/* آپلود عکس */}
              <div className="relative group mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {!editMode ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                  {user?.phone && (
                    <p className="text-sm text-gray-500 mt-1">{user?.phone}</p>
                  )}
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
                  >
                    <Edit className="h-4 w-4" />
                    ویرایش اطلاعات
                  </button>
                </>
              ) : (
                <form
                  onSubmit={handleUpdateProfile}
                  className="w-full mt-4 space-y-3"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      ایمیل قابل تغییر نیست
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1">
                      تلفن
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          avatar: user?.avatar || "",
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      ذخیره
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                  toast.success("با موفقیت خارج شدید");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition font-medium"
              >
                <LogOut className="h-4 w-4" />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>

        {/* سمت چپ - منو */}
        <div className="md:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/profile/orders"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    سفارشات من
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    مشاهده تاریخچه سفارشات
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/profile/wishlist"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    علاقه‌مندی‌ها
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    محصولات مورد علاقه شما
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/profile/tickets"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    تیکت‌های پشتیبانی
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    پیگیری درخواست‌های پشتیبانی
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/profile/addresses"
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    آدرس‌ها
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    مدیریت آدرس‌های ارسال
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* اطلاعات اضافی */}
          <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 text-sm">عضویت از</p>
                <p className="font-bold">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fa-IR")
                    : "-"}
                </p>
              </div>
              <div className="text-left">
                <p className="text-blue-100 text-sm">نوع حساب</p>
                <p className="font-bold">
                  {user?.role === "admin" ? "مدیر" : "کاربر عادی"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
