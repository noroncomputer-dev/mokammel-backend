"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Sparkles,
  Upload,
  Eye,
} from "lucide-react";
import sliderService, { Slider } from "@/services/api/slider";
import api from "@/services/api/axios";
import { toast } from "sonner";

export default function AdminSliderPage() {
  const [slides, setSlides] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "/products",
    order: 0,
    buttonText: "مشاهده محصولات",
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await sliderService.getAllSlides();
      setSlides(data);
    } catch (error) {
      console.error("Error fetching slides:", error);
    } finally {
      setLoading(false);
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
      const response = await api.post("/upload", fd);
      const imageUrl = response.data.data?.url;
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        toast.success("تصویر با موفقیت آپلود شد");
      }
    } catch (error) {
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      toast.error("عنوان و تصویر اسلاید الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSlide) {
        await sliderService.updateSlide(editingSlide._id, formData);
        toast.success("اسلاید با موفقیت ویرایش شد");
      } else {
        await sliderService.createSlide(formData);
        toast.success("اسلاید با موفقیت ایجاد شد");
      }
      setShowModal(false);
      setEditingSlide(null);
      setFormData({
        title: "",
        subtitle: "",
        image: "",
        link: "/products",
        order: 0,
        buttonText: "مشاهده محصولات",
        isActive: true,
      });
      fetchSlides();
    } catch (error) {
      toast.error("خطا در ذخیره اسلاید");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await sliderService.deleteSlide(deleteId);
      toast.success("اسلاید با موفقیت حذف شد");
      setDeleteId(null);
      fetchSlides();
    } catch (error) {
      toast.error("خطا در حذف اسلاید");
    }
  };

  const handleEdit = (slide: Slider) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      image: slide.image,
      link: slide.link,
      order: slide.order,
      buttonText: slide.buttonText,
      isActive: slide.isActive,
    });
    setShowModal(true);
  };

  const toggleActive = async (slide: Slider) => {
    try {
      await sliderService.updateSlide(slide._id, { isActive: !slide.isActive });
      fetchSlides();
      toast.success(`اسلاید ${!slide.isActive ? "فعال" : "غیرفعال"} شد`);
    } catch (error) {
      toast.error("خطا در تغییر وضعیت");
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

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت اسلایدر
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت اسلایدهای صفحه اصلی
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null);
            setFormData({
              title: "",
              subtitle: "",
              image: "",
              link: "/products",
              order: 0,
              buttonText: "مشاهده محصولات",
              isActive: true,
            });
            setShowModal(true);
          }}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          اسلاید جدید
        </button>
      </div>

      {/* ==================== لیست اسلایدها لوکس ==================== */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 card-luxury">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">هیچ اسلایدی وجود ندارد</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide, index) => (
            <div
              key={slide._id}
              className="card-luxury overflow-hidden hover:shadow-gold transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-32 bg-muted/50 relative overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {slide.title}
                      </h3>
                      {slide.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground/70">
                        <span>ترتیب: {slide.order}</span>
                        <span>لینک: {slide.link}</span>
                        <span>دکمه: {slide.buttonText}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(slide)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          slide.isActive
                            ? "badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : "badge-gold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {slide.isActive ? "فعال" : "غیرفعال"}
                      </button>
                      <button
                        onClick={() => handleEdit(slide)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                        title="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(slide._id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 hover:scale-110"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== مودال افزودن/ویرایش لوکس ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold gold-text flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {editingSlide ? "ویرایش اسلاید" : "اسلاید جدید"}
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
                <label className={labelClass}>عنوان *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={inputClass}
                  required
                  placeholder="عنوان اسلاید"
                />
              </div>
              <div>
                <label className={labelClass}>زیرنویس</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className={inputClass}
                  placeholder="زیرنویس اسلاید"
                />
              </div>
              <div>
                <label className={labelClass}>تصویر *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className={inputClass}
                    placeholder="آدرس تصویر"
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground text-sm cursor-pointer hover:border-primary hover:text-primary transition-all duration-200 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
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
                  <div className="mt-2 relative group/img">
                    <img
                      src={formData.image}
                      alt="preview"
                      className="w-32 h-20 object-cover rounded-lg border border-border"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover/img:opacity-100 transition-all duration-200 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                {uploading && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    در حال آپلود...
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>لینک</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className={inputClass}
                  placeholder="/products"
                />
              </div>
              <div>
                <label className={labelClass}>متن دکمه</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonText: e.target.value })
                  }
                  className={inputClass}
                  placeholder="مشاهده محصولات"
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
                  disabled={submitting}
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
              <h3 className="text-lg font-bold text-foreground">حذف اسلاید</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این اسلاید اطمینان دارید؟ این عمل قابل بازگشت نیست.
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
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold transition-all duration-200 shadow-md flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
