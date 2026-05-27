"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="max-w-md w-full text-center">
        {/* آیکون خطا */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-500/10 rounded-full mb-6">
          <XCircle className="h-12 w-12 text-rose-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          پرداخت ناموفق بود
        </h1>

        <p className="text-muted-foreground mb-8">
          متأسفانه پرداخت شما با خطا مواجه شد. لطفاً مجدداً تلاش کنید.
        </p>

        {/* دکمه‌های اقدام */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              href={`/payment/${orderId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-gold rounded-xl font-bold shadow-md"
            >
              <ShoppingBag size={18} />
              تلاش مجدد برای پرداخت
            </Link>
          )}

          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-gold-outline rounded-xl font-bold"
          >
            <ArrowLeft size={18} />
            بازگشت به سبد خرید
          </Link>
        </div>

        {/* پیام پشتیبانی */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            در صورت کسر وجه، طی ۷۲ ساعت به حساب شما باز می‌گردد
          </div>
        </div>
      </div>
    </div>
  );
}
