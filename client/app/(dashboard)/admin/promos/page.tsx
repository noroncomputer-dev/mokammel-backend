"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  X,
  Loader2,
  Percent,
  Zap,
  Gift,
  Clock,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import promosService, { Promo } from "@/services/api/promo";
import { useAuthStore } from "@/store/auth.store";
import api from "@/services/api/axios"; // ✅ اضافه شد

const iconOptions = [
  { value: "Percent", label: "درصد", icon: Percent },
  { value: "Zap", label: "صاعقه", icon: Zap },
  { value: "Gift", label: "هدیه", icon: Gift },
  { value: "Clock", label: "ساعت", icon: Clock },
  { value: "Sparkles", label: "ستاره", icon: Sparkles },
];

export default function AdminPromosPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badge: "",
    image: "",
    link: "/products",
    buttonText: "مشاهده محصولات",
    icon: "Percent" as const,
    order: 0,
    isActive: true,
  });

  // بررسی دسترسی ادمین
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const data = await promosService.getAllPromos();
      setPromos(data);
    } catch (error) {
      console.error("Error fetching promos:", error);
      toast.error("خطا در دریافت بنرها");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        title: promo.title,
        subtitle: promo.subtitle || "",
        badge: promo.badge || "",
        image: promo.image,
        link: promo.link,
        buttonText: promo.buttonText,
        icon: promo.icon,
        order: promo.order,
        isActive: promo.isActive,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        title: "",
        subtitle: "",
        badge: "",
        image: "",
        link: "/products",
        buttonText: "مشاهده محصولات",
        icon: "Percent",
        order: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image.trim()) {
      toast.error("عنوان و تصویر بنر الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      if (editingPromo) {
        await promosService.updatePromo(editingPromo._id, formData);
        toast.success("بنر با موفقیت ویرایش شد");
      } else {
        await promosService.createPromo(formData);
        toast.success("بنر با موفقیت ایجاد شد");
      }
      setShowModal(false);
      fetchPromos();
    } catch (error: any) {
      console.error("Error saving promo:", error);
      toast.error(error.response?.data?.message || "خطا در ذخیره بنر");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await promosService.deletePromo(deleteId);
      toast.success("بنر با موفقیت حذف شد");
      setDeleteId(null);
      fetchPromos();
    } catch (error: any) {
      console.error("Error deleting promo:", error);
      toast.error(error.response?.data?.message || "خطا در حذف بنر");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await api.post("/upload", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = response.data.data?.url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        toast.success("تصویر با موفقیت آپلود شد");
      } else {
        toast.error("آدرس تصویر دریافت نشد");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "خطا در آپلود تصویر");
    } finally {
      setUploading(false);
      // reset input
      e.target.value = "";
    }
  };

  const filteredPromos = promos.filter((promo) =>
    promo.title.toLowerCase().includes(search.toLowerCase()),
  );

  const getIconComponent = (iconName: string) => {
    const found = iconOptions.find((i) => i.value === iconName);
    return found?.icon || Percent;
  };

  if (loading) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت بنرها
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت بنرهای تبلیغاتی صفحه اصلی
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          بنر جدید
        </button>
      </div>

      {/* جستجو */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی بنر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-luxury w-full pr-10 pl-4 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* جدول بنرها */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  تصویر
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  عنوان
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  آیکون
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  ترتیب
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPromos.map((promo, index) => {
                const IconComp = getIconComponent(promo.icon);
                return (
                  <tr
                    key={promo._id}
                    className="group hover:bg-muted/30 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/50 border border-border/50">
                        <img
                          src={promo.image}
                          alt={promo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {promo.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {promo.subtitle}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComp className="h-4 w-4 text-primary" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {promo.order}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {promo.isActive ? (
                        <span className="badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                          فعال
                        </span>
                      ) : (
                        <span className="badge-gold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(promo)}
                          className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200"
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4 text-primary/70 hover:text-primary" />
                        </button>
                        <button
                          onClick={() => setDeleteId(promo._id)}
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500/70 hover:text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال افزودن/ویرایش */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-lg w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold gold-text">
                {editingPromo ? "ویرایش بنر" : "بنر جدید"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-muted transition-all duration-200"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  عنوان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-luxury w-full px-4 py-2.5 text-sm"
                  placeholder="مثال: تخفیف ویژه"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  زیرنویس
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="input-luxury w-full px-4 py-2.5 text-sm"
                  placeholder="مثال: تا ۳۰٪ تخفیف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  برچسب (بج)
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  className="input-luxury w-full px-4 py-2.5 text-sm"
                  placeholder="مثال: پروتئین وی"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                  تصویر بنر *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="input-luxury flex-1 px-4 py-2.5 text-sm"
                    placeholder="https://... یا آپلود کنید"
                    required
                  />
                  <label
                    className={`btn-gold-outline px-4 py-2.5 text-sm font-medium cursor-pointer whitespace-nowrap ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin inline ml-1" />
                    ) : (
                      <Upload className="h-4 w-4 inline ml-1" />
                    )}
                    آپلود
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.image}
                      alt="پیش‌نمایش"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    لینک
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="input-luxury w-full px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    متن دکمه
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="input-luxury w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    آیکون
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value as any })
                    }
                    className="input-luxury w-full px-4 py-2.5 text-sm"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                    ترتیب نمایش
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number(e.target.value),
                      })
                    }
                    className="input-luxury w-full px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition">
                    فعال بودن
                  </span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-gold-outline px-5 py-2 text-sm font-medium"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-5 py-2 text-sm font-bold flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* دیالوگ حذف */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">حذف بنر</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این بنر اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-gold-outline px-5 py-2 text-sm font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold transition-all duration-200 shadow-md"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
