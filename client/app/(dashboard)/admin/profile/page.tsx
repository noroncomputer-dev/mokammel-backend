"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Loader2,
  Sparkles,
  Camera,
  Key,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/services/api/axios";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function AdminProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put("/users/profile", formData);
      if (response.data.success) {
        setUser({ ...user, ...formData });
        toast.success("اطلاعات با موفقیت به‌روزرسانی شد");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در به‌روزرسانی");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const response = await api.post("/upload", fd);
      const avatarUrl = response.data.data?.url;
      if (avatarUrl) {
        await api.put("/users/profile", { avatar: avatarUrl });
        setUser({ ...user, avatar: avatarUrl });
        toast.success("آواتار با موفقیت به‌روزرسانی شد");
      }
    } catch (error) {
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition-colors";

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر ==================== */}
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            حساب کاربری
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold gold-text">پروفایل من</h1>
        <p className="text-sm text-muted-foreground mt-1">
          مشاهده و ویرایش اطلاعات حساب کاربری
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== سایدبار راست ==================== */}
        <div className="lg:col-span-1 space-y-4">
          {/* کارت آواتار */}
          <div className="card-luxury p-6 text-center">
            <div className="relative inline-block mx-auto">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/20 mx-auto">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer shadow-glow hover:scale-110 transition-all duration-200">
                <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && (
              <p className="text-xs text-primary mt-2">در حال آپلود...</p>
            )}
            <h3 className="font-bold text-foreground mt-3">{user?.name}</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              نقش:{" "}
              {user?.role === "admin"
                ? "مدیر کل"
                : user?.role === "moderator"
                  ? "مدیر محتوا"
                  : "کاربر عادی"}
            </p>
          </div>

          {/* لینک‌های سریع */}
          <div className="card-luxury p-4">
            <Link
              href="/admin/profile/settings"
              className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
            >
              <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">تنظیمات حساب</span>
            </Link>
            <Link
              href="/admin/profile/change-password"
              className="flex items-center gap-3 p-3 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
            >
              <Key className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">تغییر رمز عبور</span>
            </Link>
          </div>
        </div>

        {/* ==================== فرم اصلی ==================== */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card-luxury p-6 space-y-5">
            <h2 className="text-lg font-bold gold-text flex items-center gap-2">
              <User className="h-5 w-5" />
              اطلاعات شخصی
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>نام کامل</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                  placeholder="نام خود را وارد کنید"
                />
              </div>
              <div>
                <label className={labelClass}>ایمیل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputClass}
                  placeholder="ایمیل خود را وارد کنید"
                />
              </div>
              <div>
                <label className={labelClass}>تلفن همراه</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={inputClass}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                />
              </div>
              <div>
                <label className={labelClass}>آدرس</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={inputClass}
                  placeholder="آدرس خود را وارد کنید"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold px-6 py-2.5 text-sm font-bold flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
