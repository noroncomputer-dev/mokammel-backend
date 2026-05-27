"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

const formatPrice = (price: number) => {
  if (isNaN(price) || price === undefined || price === null) {
    return "0 تومان";
  }
  return price.toLocaleString("fa-IR") + " تومان";
};

interface Order {
  _id: string;
  orderNumber: string;
  finalPrice: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      console.log("Order data:", response.data);

      if (response.data.success) {
        const orderData = response.data.data.order;
        let finalPrice = orderData.finalPrice;
        if (isNaN(finalPrice) || finalPrice < 0) {
          finalPrice = 0;
        }
        setOrder({ ...orderData, finalPrice });
      } else {
        setError("سفارش یافت نشد");
      }
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات سفارش");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);
    setError(null);

    try {
      console.log("Sending payment request:", {
        orderId: order._id,
        amount: order.finalPrice,
        description: `پرداخت سفارش شماره ${order.orderNumber}`,
      });

      const response = await api.post("/payment/zarinpal", {
        orderId: order._id,
        amount: order.finalPrice,
        description: `پرداخت سفارش شماره ${order.orderNumber}`,
      });

      console.log("Payment response:", response.data);

      if (response.data.success) {
        // ریدایرکت به درگاه زرین‌پال
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error(response.data.message || "خطا در اتصال به درگاه پرداخت");
        setError(response.data.message || "خطا در اتصال به درگاه پرداخت");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg =
        err.response?.data?.message || "خطا در اتصال به درگاه پرداخت";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96" dir="rtl">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          در حال بارگذاری اطلاعات سفارش...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16" dir="rtl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          خطا در دریافت اطلاعات
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {error || "سفارش یافت نشد"}
        </p>
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
        >
          <ArrowLeft size={18} />
          بازگشت به سفارشات من
        </Link>
      </div>
    );
  }

  // اگر قبلاً پرداخت شده
  if (order.paymentStatus === "paid") {
    return (
      <div className="text-center py-16" dir="rtl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          این سفارش قبلاً پرداخت شده است
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          سفارش شما با موفقیت پرداخت شده و در حال پردازش است.
        </p>
        <Link
          href={`/track-order/${order._id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
        >
          پیگیری سفارش
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" dir="rtl">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* هدر */}
        <div className="bg-gradient-to-l from-blue-600 to-indigo-600 p-6 text-white text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold">تکمیل پرداخت</h1>
          <p className="text-blue-100 mt-1">
            لطفاً برای نهایی‌سازی سفارش، پرداخت را انجام دهید
          </p>
        </div>

        {/* اطلاعات سفارش */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">
              شماره سفارش:
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">تاریخ ثبت:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(order.createdAt).toLocaleDateString("fa-IR")}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">
              وضعیت سفارش:
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
              در انتظار پرداخت
            </span>
          </div>

          <div className="flex justify-between items-center pt-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              مبلغ قابل پرداخت:
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(order.finalPrice)}
            </span>
          </div>
        </div>

        {/* دکمه پرداخت */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={handlePayment}
            disabled={processing || order.finalPrice <= 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                در حال اتصال به درگاه پرداخت...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                پرداخت آنلاین
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <p className="text-xs text-center text-gray-400 mt-4">
            با کلیک روی دکمه پرداخت، به درگاه امن زرین‌پال هدایت می‌شوید.
          </p>
        </div>

        {/* لینک بازگشت */}
        <div className="p-4 text-center border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/profile/orders"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft size={14} />
            بازگشت به سفارشات من
          </Link>
        </div>
      </div>
    </div>
  );
}
