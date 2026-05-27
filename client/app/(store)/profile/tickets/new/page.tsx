"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Search, X } from "lucide-react";
import ticketService from "@/services/api/tickets";
import api from "@/services/api/axios";
import { toast } from "sonner";

const categories = [
  { value: "payment", label: "مشکل پرداخت" },
  { value: "delivery", label: "مشکل ارسال" },
  { value: "product", label: "مشکل محصول" },
  { value: "account", label: "مشکل حساب کاربری" },
  { value: "other", label: "سایر موارد" },
];

const priorities = [
  { value: "low", label: "کم" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "زیاد" },
  { value: "urgent", label: "فوری" },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [searchOrder, setSearchOrder] = useState("");
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [foundOrder, setFoundOrder] = useState<{
    _id: string;
    orderNumber: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "other",
    priority: "medium",
    orderId: "",
  });

  // جستجوی سفارش
  const handleSearchOrder = async () => {
    if (!searchOrder.trim()) {
      toast.error("لطفاً شماره سفارش را وارد کنید");
      return;
    }

    setSearchingOrder(true);
    try {
      // جستجوی سفارش با شماره
      const response = await api.get(`/orders/track/${searchOrder}`);
      if (response.data.success) {
        const order = response.data.data.order;
        setFoundOrder({
          _id: order._id,
          orderNumber: order.orderNumber,
        });
        setFormData((prev) => ({ ...prev, orderId: order._id }));
        toast.success("سفارش یافت شد");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("سفارشی با این شماره یافت نشد");
      } else {
        toast.error("خطا در جستجوی سفارش");
      }
      setFoundOrder(null);
      setFormData((prev) => ({ ...prev, orderId: "" }));
    } finally {
      setSearchingOrder(false);
    }
  };

  const clearFoundOrder = () => {
    setFoundOrder(null);
    setSearchOrder("");
    setFormData((prev) => ({ ...prev, orderId: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("لطفاً عنوان و متن تیکت را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      await ticketService.createTicket({
        subject: formData.subject,
        message: formData.message,
        category: formData.category,
        priority: formData.priority,
        orderId: formData.orderId || undefined,
      });
      toast.success("تیکت شما با موفقیت ثبت شد");
      router.push("/profile/tickets");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "خطا در ثبت تیکت");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Link
          href="/profile/tickets"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            تیکت جدید
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            مشکل خود را مطرح کنید، کارشناسان ما در اسرع وقت پاسخ خواهند داد
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5"
      >
        {/* جستجوی سفارش */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            شماره سفارش (اختیاری)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              placeholder="مثال: ORD-260523-0009"
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleSearchOrder}
              disabled={searchingOrder}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition disabled:opacity-50"
            >
              {searchingOrder ? (
                "در حال جستجو..."
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* نمایش سفارش پیدا شده */}
          {foundOrder && (
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  سفارش یافت شد
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  {foundOrder.orderNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={clearFoundOrder}
                className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            در صورت مرتبط بودن مشکل با یک سفارش، شماره آن را وارد کنید
          </p>
        </div>

        {/* بقیه فیلدها */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              دسته‌بندی *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اولویت *
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            عنوان *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثال: مشکل در پرداخت سفارش"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            متن مشکل *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={6}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مشکل خود را به طور کامل توضیح دهید..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/profile/tickets"
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            انصراف
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? (
              "در حال ثبت..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                ثبت تیکت
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
