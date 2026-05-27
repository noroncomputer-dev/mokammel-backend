"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Ticket,
  Calendar,
  Sparkles,
} from "lucide-react";
import api from "../../../services/api/axios";
import { toast } from "sonner";
import couponService from "@/services/api/coupons";

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getAllCoupons(page, 20);
      // تبدیل داده‌های بک‌اند به فرمت فرانت‌اند
      const formattedCoupons = response.coupons.map((coupon: any) => ({
        ...coupon,
        discountType: coupon.type,
        discountValue: coupon.value,
        maxDiscountAmount: coupon.maxDiscount,
        endDate: coupon.expiresAt,
      }));
      setCoupons(formattedCoupons);
      setTotalPages(response.pagination.pages);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      toast.error("خطا در دریافت کدهای تخفیف");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minOrderAmount: coupon.minOrderAmount?.toString() || "",
        maxDiscountAmount: coupon.maxDiscountAmount?.toString() || "",
        usageLimit: coupon.usageLimit?.toString() || "",
        startDate: coupon.startDate?.split("T")[0] || "",
        endDate: coupon.endDate?.split("T")[0] || "",
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: "",
        maxDiscountAmount: "",
        usageLimit: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("کد تخفیف الزامی است");
      return;
    }
    if (!formData.discountValue) {
      toast.error("مقدار تخفیف الزامی است");
      return;
    }
    if (!formData.endDate) {
      toast.error("تاریخ انقضا الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      // داده‌ها را مطابق با بک‌اند ارسال کن
      const dataToSend = {
        code: formData.code.toUpperCase(),
        type: formData.discountType as "percentage" | "fixed",
        value: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? Number(formData.minOrderAmount)
          : 0,
        maxDiscount: formData.maxDiscountAmount
          ? Number(formData.maxDiscountAmount)
          : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 1,
        expiresAt: formData.endDate,
        isActive: formData.isActive,
      };

      console.log("📦 Sending coupon data:", dataToSend);

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon._id, dataToSend);
        toast.success("کد تخفیف با موفقیت ویرایش شد");
      } else {
        await couponService.createCoupon(dataToSend);
        toast.success("کد تخفیف با موفقیت ایجاد شد");
      }
      setShowModal(false);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      toast.error(error.response?.data?.message || "خطا در ذخیره کد تخفیف");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await couponService.deleteCoupon(deleteId);
      toast.success("کد تخفیف با موفقیت حذف شد");
      setDeleteId(null);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      toast.error(error.response?.data?.message || "خطا در حذف کد تخفیف");
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isNotStarted = (startDate: string) => {
    return startDate && new Date(startDate) > new Date();
  };

  const getStatusBadge = (coupon: Coupon) => {
    const expired = isExpired(coupon.endDate);
    const notStarted = isNotStarted(coupon.startDate);

    if (!coupon.isActive) {
      return {
        text: "غیرفعال",
        cls: "badge-gold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      };
    }
    if (expired) {
      return {
        text: "منقضی شده",
        cls: "badge-gold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      };
    }
    if (notStarted) {
      return {
        text: "شروع نشده",
        cls: "badge-gold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      };
    }
    return {
      text: "فعال",
      cls: "badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    };
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(search.toLowerCase()),
  );

  // ==================== استایل‌های طلایی-مشکی ====================
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";
  const labelClass =
    "block text-sm font-medium text-foreground/80 mb-1.5 transition-colors";
  const textareaClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm resize-vertical";
  const selectClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm cursor-pointer";
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
              پنل
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت کدهای تخفیف
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ایجاد و مدیریت کدهای تخفیف برای محصولات
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          کد تخفیف جدید
        </button>
      </div>

      {/* ==================== جستجو ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی کد تخفیف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ==================== جدول کدهای تخفیف ==================== */}
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
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Ticket className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">کد تخفیفی یافت نشد</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    کد
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تخفیف
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    حداقل سفارش
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تعداد استفاده
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تاریخ انقضا
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
                {filteredCoupons.map((coupon, index) => {
                  const status = getStatusBadge(coupon);

                  return (
                    <tr
                      key={coupon._id}
                      className="group hover:bg-muted/30 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-mono font-bold text-foreground">
                              {coupon.code}
                            </span>
                            {coupon.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold gold-text">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}%`
                              : `${coupon.discountValue.toLocaleString()} تومان`}
                          </span>
                          {coupon.maxDiscountAmount &&
                            coupon.discountType === "percentage" && (
                              <span className="text-xs text-muted-foreground">
                                حداکثر:{" "}
                                {coupon.maxDiscountAmount.toLocaleString()}{" "}
                                تومان
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {coupon.minOrderAmount
                            ? `${coupon.minOrderAmount.toLocaleString()} تومان`
                            : "ندارد"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {coupon.usedCount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {coupon.usageLimit || "∞"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(coupon.endDate).toLocaleDateString(
                              "fa-IR",
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={status.cls}>{status.text}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(coupon)}
                            className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 group/btn"
                            title="ویرایش"
                          >
                            <Pencil className="h-4 w-4 text-primary/70 group-hover/btn:text-primary transition-colors" />
                          </button>
                          <button
                            onClick={() => setDeleteId(coupon._id)}
                            className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 group/btn"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500/70 group-hover/btn:text-rose-500 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* صفحه‌بندی */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              صفحه <span className="text-primary font-medium">{page}</span> از{" "}
              {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 transition-all duration-200"
              >
                قبلی
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 transition-all duration-200"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== مودال افزودن/ویرایش ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="card-luxury max-w-lg w-full p-6 shadow-2xl my-8 animate-fadeUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold gold-text flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                {editingCoupon ? "ویرایش کد تخفیف" : "کد تخفیف جدید"}
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
                <label className={labelClass}>کد تخفیف *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  className={inputClass}
                  placeholder="مثال: SUMMER1403"
                  dir="ltr"
                />
              </div>

              <div>
                <label className={labelClass}>توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className={textareaClass}
                  placeholder="توضیحات کد تخفیف..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>نوع تخفیف *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className={selectClass}
                  >
                    <option value="percentage">درصدی (%)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>مقدار تخفیف *</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    required
                    className={inputClass}
                    placeholder={
                      formData.discountType === "percentage"
                        ? "مثال: 20"
                        : "مثال: 50000"
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>حداقل مبلغ سفارش</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="تومان"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    حداکثر تخفیف (برای درصدی)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscountAmount: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="تومان"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>محدودیت تعداد استفاده</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  className={inputClass}
                  placeholder="خالی = نامحدود"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>تاریخ شروع</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>تاریخ انقضا *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                    className={inputClass}
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

      {/* ==================== دیالوگ حذف ==================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                حذف کد تخفیف
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این کد تخفیف اطمینان دارید؟ این عمل قابل بازگشت نیست.
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
