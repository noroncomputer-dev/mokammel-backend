"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Users,
  Package,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  exportOrdersToText,
  exportTopProductsToText,
  exportUsersToText,
} from "@/services/api/export";

export default function AdminAnalyticsPage() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: "orders" | "products" | "users") => {
    setExporting(type);
    let success = false;

    switch (type) {
      case "orders":
        success = await exportOrdersToText();
        break;
      case "products":
        success = await exportTopProductsToText();
        break;
      case "users":
        success = await exportUsersToText();
        break;
    }

    setExporting(null);

    if (success) {
      alert("گزارش با موفقیت ذخیره شد");
    } else {
      alert("خطا در ایجاد گزارش");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            پنل مدیریت
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold gold-text">گزارش‌ها</h1>
        <p className="text-sm text-muted-foreground mt-1">
          دریافت گزارش‌های مختلف فروشگاه
        </p>
      </div>

      {/* ==================== کارت‌های گزارش ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* کارت گزارش سفارشات - طلایی */}
        <div className="card-luxury p-6 transition-all duration-300 hover:shadow-gold group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-base">
              گزارش سفارشات
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            دریافت لیست کامل سفارشات با جزئیات مشتریان، محصولات و مبالغ
          </p>
          <button
            onClick={() => handleExport("orders")}
            disabled={exporting === "orders"}
            className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === "orders" ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                در حال ساخت...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                دریافت گزارش سفارشات
              </>
            )}
          </button>
        </div>

        {/* کارت گزارش محصولات پرفروش - سبز زمردی */}
        <div className="card-luxury p-6 transition-all duration-300 hover:shadow-gold group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-base">
              محصولات پرفروش
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            دریافت لیست محصولات بر اساس تعداد فروش، درآمد و موجودی
          </p>
          <button
            onClick={() => handleExport("products")}
            disabled={exporting === "products"}
            className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === "products" ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                در حال ساخت...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                دریافت گزارش محصولات
              </>
            )}
          </button>
        </div>

        {/* کارت گزارش کاربران - بنفش */}
        <div className="card-luxury p-6 transition-all duration-300 hover:shadow-glow group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground   text-primary">
              گزارش کاربران
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            دریافت لیست کامل کاربران با اطلاعات تماس و تاریخ ثبت‌نام
          </p>
          <button
            onClick={() => handleExport("users")}
            disabled={exporting === "users"}
            className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting === "users" ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                در حال ساخت...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                دریافت گزارش کاربران
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================== اطلاع‌رسانی ==================== */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-start gap-3 transition-all duration-200">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 shrink-0">
          <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          گزارش‌ها به صورت فایل متنی (TXT) در کامپیوتر شما ذخیره می‌شوند.
        </p>
      </div>
    </div>
  );
}
