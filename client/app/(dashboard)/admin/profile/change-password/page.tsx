"use client";

import { useState } from "react";
import { Key, Save, Loader2, Sparkles, ArrowRight } from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setLoading(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("رمز عبور با موفقیت تغییر کرد");
      router.push("/admin/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در تغییر رمز عبور");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition-colors";

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            امنیت حساب
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold gold-text">
          تغییر رمز عبور
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          برای حفظ امنیت حساب خود، رمز عبور قوی انتخاب کنید
        </p>
      </div>

      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="card-luxury p-6 space-y-5">
          <h2 className="text-lg font-bold gold-text flex items-center gap-2">
            <Key className="h-5 w-5" />
            رمز عبور جدید
          </h2>

          <div>
            <label className={labelClass}>رمز عبور فعلی</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
              className={inputClass}
              required
              placeholder="رمز عبور فعلی را وارد کنید"
            />
          </div>

          <div>
            <label className={labelClass}>رمز عبور جدید</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className={inputClass}
              required
              placeholder="رمز عبور جدید (حداقل ۶ کاراکتر)"
            />
          </div>

          <div>
            <label className={labelClass}>تکرار رمز عبور جدید</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className={inputClass}
              required
              placeholder="رمز عبور جدید را دوباره وارد کنید"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Link
              href="/admin/profile"
              className="btn-gold-outline px-5 py-2 text-sm font-medium"
            >
              انصراف
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
              {loading ? "در حال تغییر..." : "تغییر رمز"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
