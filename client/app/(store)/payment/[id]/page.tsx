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
  Sparkles,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";

const formatPrice = (price: number) => {
  if (isNaN(price) || price === undefined || price === null) {
    return "۰ تومان";
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
    try {
      const response = await api.post("/payment/zarinpal", {
        orderId: order._id,
        amount: order.finalPrice,
        description: `پرداخت سفارش شماره ${order.orderNumber}`,
      });

      if (response.data.success) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error(response.data.message || "خطا در اتصال به درگاه پرداخت");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(
        err.response?.data?.message || "خطا در اتصال به درگاه پرداخت",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96" dir="rtl">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground mt-4">
          در حال بارگذاری اطلاعات سفارش...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16" dir="rtl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 mb-6">
          <XCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          خطا در دریافت اطلاعات
        </h1>
        <p className="text-muted-foreground mb-8">
          {error || "سفارش یافت نشد"}
        </p>
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 px-6 py-3 btn-gold rounded-xl font-bold shadow-md"
        >
          <ArrowLeft size={18} />
          بازگشت به سفارشات من
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12" dir="rtl">
      <div className="bg-card rounded-2xl border border-border shadow-premium overflow-hidden">
        {/* هدر طلایی */}
        <div className="bg-gradient-to-l from-primary to-primary/80 p-6 text-primary-foreground text-center">
          <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold">تکمیل پرداخت</h1>
          <p className="text-primary-foreground/80 mt-1">
            لطفاً برای نهایی‌سازی سفارش، پرداخت را انجام دهید
          </p>
        </div>

        {/* اطلاعات سفارش */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground">شماره سفارش:</span>
            <span className="font-mono font-bold text-foreground">
              {order.orderNumber}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground">تاریخ ثبت:</span>
            <span className="text-foreground">
              {new Date(order.createdAt).toLocaleDateString("fa-IR")}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground">وضعیت سفارش:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              در انتظار پرداخت
            </span>
          </div>

          <div className="flex justify-between items-center pt-3">
            <span className="text-lg font-bold text-foreground">
              مبلغ قابل پرداخت:
            </span>
            <span className="text-2xl font-bold gold-text">
              {formatPrice(order.finalPrice)}
            </span>
          </div>
        </div>

        {/* دکمه پرداخت */}
        <div className="p-6 border-t border-border bg-muted/30">
          <button
            onClick={handlePayment}
            disabled={processing || order.finalPrice <= 0}
            className="w-full py-4 btn-gold rounded-xl font-bold flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-strong transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-xs text-center text-muted-foreground mt-4">
            با کلیک روی دکمه پرداخت، به درگاه امن زرین‌پال هدایت می‌شوید.
          </p>
        </div>

        {/* لینک بازگشت */}
        <div className="p-4 text-center border-t border-border">
          <Link
            href="/profile/orders"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft size={14} />
            بازگشت به سفارشات من
          </Link>
        </div>
      </div>
    </div>
  );
}
