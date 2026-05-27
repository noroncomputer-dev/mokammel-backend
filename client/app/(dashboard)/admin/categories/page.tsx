"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  FolderTree,
  Sparkles,
  Upload,
  Loader2,
} from "lucide-react";
import api from "../../../services/api/axios";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      let categoriesList: Category[] = [];

      if (res.data?.data?.categories) {
        categoriesList = res.data.data.categories;
      } else if (res.data?.data) {
        categoriesList = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesList = res.data;
      } else if (res.data?.categories) {
        categoriesList = res.data.categories;
      }

      setCategories(categoriesList);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        order: category.order || 0,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        order: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  // تابع آپلود تصویر
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
        headers: { "Content-Type": "multipart/form-data" },
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
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("نام دسته‌بندی الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success("دسته‌بندی با موفقیت ویرایش شد");
      } else {
        await api.post("/categories", formData);
        toast.success("دسته‌بندی با موفقیت ایجاد شد");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "خطا در ذخیره دسته‌بندی");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      toast.success("دسته‌بندی با موفقیت حذف شد");
      setDeleteId(null);
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "خطا در حذف دسته‌بندی");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ==================== استایل‌های طلایی-مشکی ====================
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition-colors";
  const textareaClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm resize-vertical";
  const checkboxClass =
    "w-4 h-4 rounded border-border text-primary focus:ring-primary/30 focus:ring-offset-0 bg-muted/50 transition-all duration-200";

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت دسته‌بندی‌ها
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت دسته‌بندی‌های محصولات فروشگاه
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          دسته‌بندی جدید
        </button>
      </div>

      {/* ==================== جستجو ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی دسته‌بندی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ==================== جدول دسته‌بندی‌ها ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <FolderTree className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">دسته‌بندی‌ای یافت نشد</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تصویر
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    نام دسته‌بندی
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    slug
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
                {filteredCategories.map((category, index) => (
                  <tr
                    key={category._id}
                    className="group hover:bg-muted/30 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted/50 border border-border/50">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderTree className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-foreground">
                        {category.name}
                      </span>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-mono text-muted-foreground">
                        {category.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {category.order}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {category.isActive ? (
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
                          onClick={() => handleOpenModal(category)}
                          className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 group/btn"
                          title="ویرایش"
                        >
                          <Pencil className="h-4 w-4 text-primary/70 group-hover/btn:text-primary transition-colors" />
                        </button>
                        <button
                          onClick={() => setDeleteId(category._id)}
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 group/btn"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500/70 group-hover/btn:text-rose-500 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ==================== مودال افزودن/ویرایش با آپلود تصویر ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold gold-text flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                {editingCategory ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
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
                <label className={labelClass}>نام دسته‌بندی *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className={inputClass}
                  placeholder="مثال: پروتئین وی"
                />
              </div>

              <div>
                <label className={labelClass}>توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className={textareaClass}
                  placeholder="توضیحات دسته‌بندی..."
                />
              </div>

              {/* ==================== بخش آپلود تصویر ==================== */}
              <div>
                <label className={labelClass}>تصویر دسته‌بندی</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="input-luxury flex-1 px-4 py-2.5 text-sm"
                    placeholder="https://... یا آپلود کنید"
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

                {/* پیش‌نمایش تصویر */}
                {formData.image && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-border/50 bg-muted/20 group">
                      <img
                        src={formData.image}
                        alt="پیش‌نمایش"
                        className="w-full h-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      تصویر با ابعاد مربع (۱:۱) بهتر نمایش داده می‌شود.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>ترتیب نمایش</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) })
                  }
                  className={inputClass}
                  placeholder="۰"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className={checkboxClass}
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
                  disabled={submitting || uploading}
                  className="btn-gold px-5 py-2 text-sm font-bold flex items-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  )}
                  {submitting ? "در حال ذخیره..." : "ذخیره"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== دیالوگ حذف لوکس ==================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                حذف دسته‌بندی
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این دسته‌بندی اطمینان دارید؟ این عمل قابل بازگشت نیست.
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
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold transition-all duration-200 shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {deleting ? "در حال حذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
