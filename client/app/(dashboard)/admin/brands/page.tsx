"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Building2,
  Sparkles,
  Upload,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";
import brandService, { Brand } from "@/services/api/brands";

export default function AdminBrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    origin: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await brandService.getBrands();
      console.log("Fetched brands data:", data); // برای دیباگ

      // ✅ اطمینان از اینکه data یک آرایه است
      if (data && Array.isArray(data)) {
        setBrands(data);
      } else if (data && data.brands && Array.isArray(data.brands)) {
        setBrands(data.brands);
      } else if (data && data.data && Array.isArray(data.data)) {
        setBrands(data.data);
      } else {
        console.warn("Unexpected brands data format:", data);
        setBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("خطا در دریافت برندها");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || "",
        logo: brand.logo || "",
        origin: brand.origin || "",
        order: brand.order || 0,
        isActive: brand.isActive,
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: "",
        description: "",
        logo: "",
        origin: "",
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
        setFormData((prev) => ({ ...prev, logo: imageUrl }));
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
      toast.error("نام برند الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand._id, formData);
        toast.success("برند با موفقیت ویرایش شد");
      } else {
        await brandService.createBrand(formData);
        toast.success("برند با موفقیت ایجاد شد");
      }
      setShowModal(false);
      fetchBrands();
    } catch (error: any) {
      console.error("Error saving brand:", error);
      toast.error(error.response?.data?.message || "خطا در ذخیره برند");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await brandService.deleteBrand(deleteId);
      toast.success("برند با موفقیت حذف شد");
      setDeleteId(null);
      fetchBrands();
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      toast.error(error.response?.data?.message || "خطا در حذف برند");
    } finally {
      setDeleting(false);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase()),
  );

  const inputClass =
    "input-luxury w-full px-4 py-2.5 text-sm transition-all duration-200";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition-colors";

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
            مدیریت برندها
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت برندهای محصولات فروشگاه
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          برند جدید
        </button>
      </div>

      {/* جستجو */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی برند..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* جدول برندها */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  لوگو
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  نام برند
                </th>
                <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  کشور
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
              {filteredBrands.map((brand, index) => (
                <tr
                  key={brand._id}
                  className="group hover:bg-muted/30 transition-all duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted/50 border border-border/50 flex items-center justify-center">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-foreground">
                      {brand.name}
                    </span>
                    {brand.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {brand.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {brand.origin || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {brand.order}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {brand.isActive ? (
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
                        onClick={() => handleOpenModal(brand)}
                        className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 group/btn"
                        title="ویرایش"
                      >
                        <Pencil className="h-4 w-4 text-primary/70 group-hover/btn:text-primary transition-colors" />
                      </button>
                      <button
                        onClick={() => setDeleteId(brand._id)}
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
        </div>
      </div>

      {/* ==================== مودال افزودن/ویرایش با آپلود تصویر ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-lg w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold gold-text flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {editingBrand ? "ویرایش برند" : "برند جدید"}
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
                <label className={labelClass}>نام برند *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                  placeholder="مثال: آپتیموم نیوترین"
                  required
                />
              </div>

              {/* ==================== بخش آپلود لوگو ==================== */}
              <div>
                <label className={labelClass}>لوگو برند *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) =>
                      setFormData({ ...formData, logo: e.target.value })
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

                {/* پیش‌نمایش لوگو */}
                {formData.logo && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-border/50 bg-muted/20 group">
                      <img
                        src={formData.logo}
                        alt="پیش‌نمایش لوگو"
                        className="w-full h-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logo: "" })}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      لوگو با ابعاد مربع (۱:۱) بهتر نمایش داده می‌شود.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>کشور</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  className={inputClass}
                  placeholder="مثال: آمریکا"
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
                  className={inputClass}
                  placeholder="توضیحات برند..."
                />
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
                  disabled={submitting || uploading}
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
              <h3 className="text-lg font-bold text-foreground">حذف برند</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این برند اطمینان دارید؟ این عمل قابل بازگشت نیست.
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold transition-all duration-200 shadow-md disabled:opacity-50"
              >
                {deleting ? "در حال حذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
