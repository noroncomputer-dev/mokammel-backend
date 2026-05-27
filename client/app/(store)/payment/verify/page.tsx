// app/payment/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import api from "@/services/api/axios";
import { toast } from "sonner";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const authority = searchParams.get("Authority");
      const paymentStatus = searchParams.get("Status");

      console.log("Payment verify params:", { authority, paymentStatus });

      if (!authority) {
        setStatus("failed");
        setMessage("اطلاعات پرداخت معتبر نیست.");
        return;
      }

      // اگر کاربر پرداخت را لغو کرده باشد
      if (paymentStatus === "cancel") {
        setStatus("failed");
        setMessage("پرداخت توسط شما لغو شد.");
        return;
      }

      try {
        // ✅ درخواست تأیید به بک‌اند
        const response = await api.get("/payment/verify", {
          params: { authority, status: paymentStatus },
        });

        console.log("Verify response:", response.data);

        if (response.data.success) {
          setStatus("success");
          setMessage(`پرداخت شما با موفقیت انجام شد.`);

          // پاک کردن سبد خرید
          localStorage.removeItem("cart-storage");

          // هدایت به صفحه سفارشات بعد از 3 ثانیه
          setTimeout(() => {
            router.push("/profile/orders");
          }, 3000);
        } else {
          setStatus("failed");
          setMessage(response.data.message || "پرداخت ناموفق بود.");
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("failed");
        setMessage(
          error.response?.data?.message ||
            "خطا در تأیید پرداخت. لطفاً با پشتیبانی تماس بگیرید.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center px-4"
      dir="rtl"
    >
      <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center shadow-premium">
        {status === "loading" && (
          <>
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              در حال تأیید پرداخت
            </h2>
            <p className="text-muted-foreground">لطفاً چند لحظه صبر کنید...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              پرداخت موفق
            </h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link
              href="/profile/orders"
              className="btn-gold inline-block px-6 py-2"
            >
              مشاهده سفارشات
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              پرداخت ناموفق
            </h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Link
              href="/cart"
              className="btn-gold-outline inline-block px-6 py-2"
            >
              بازگشت به سبد خرید
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
