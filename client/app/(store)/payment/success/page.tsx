"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Package, Sparkles } from "lucide-react";
import api from "@/services/api/axios";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const refId = searchParams.get("refId");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        setOrderNumber(response.data.data.order.orderNumber);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full text-center">
        {/* آیکون موفقیت */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 rounded-full mb-6">
          <CheckCircle className="h-12 w-12 text-emerald-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold gold-text mb-3">
          پرداخت با موفقیت انجام شد
        </h1>

        <p className="text-muted-foreground mb-6">
          سفارش شما ثبت و پرداخت آن تایید شد.
        </p>

        {/* اطلاعات سفارش */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-8 text-right">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="relative w-6 h-6">
                <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-1.5 h-1.5 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground text-sm">شماره سفارش:</span>
                <span className="font-bold text-foreground">{orderNumber || "در حال دریافت..."}</span>
              </div>
              {refId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">کد پیگیری:</span>
                  <span className="font-mono text-primary text-sm">{refId}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* دکمه‌های اقدام */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              href={`/track-order/${orderId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-gold rounded-xl font-bold shadow-md"
            >
              <Package size={18} />
              پیگیری سفارش
            </Link>
          )}

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-gold-outline rounded-xl font-bold"
          >
            <ArrowLeft size={18} />
            بازگشت به فروشگاه
          </Link>
        </div>

        {/* پیام اضافی */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            ایمیل تایید سفارش برای شما ارسال شد
          </div>
        </div>
      </div>
    </div>
  );
}