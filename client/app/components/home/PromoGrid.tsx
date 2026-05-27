"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  Zap,
  Percent,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import promosService, { Promo } from "@/services/api/promo";

// نقشه آیکون‌ها
const iconMap: Record<string, any> = {
  Percent: Percent,
  Zap: Zap,
  Gift: Gift,
  Clock: Clock,
  Sparkles: Sparkles,
};

export default function PromoGrid() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promosService.getActivePromos();
      setPromos(data);
    } catch (err: any) {
      console.error("Error fetching promos:", err);
      setError(err.response?.data?.message || "خطا در دریافت بنرها");
    } finally {
      setLoading(false);
    }
  };

  // نمایش لودینگ
  if (loading) {
    return (
      <section className="py-10 md:py-16 bg-background" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // نمایش خطا
  if (error) {
    return (
      <section className="py-10 md:py-16 bg-background" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-rose-500">{error}</p>
            <button
              onClick={fetchPromos}
              className="mt-4 btn-gold px-6 py-2 text-sm"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </section>
    );
  }

  // اگر بنری وجود نداشت
  if (!promos.length) {
    return null;
  }

  return (
    <section className="py-10 md:py-16 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        {/* ==================== هدر ==================== */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                پیشنهادات لحظه‌ای
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground">
              پیشنهادهای ویژه
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              بهترین تخفیف‌های مکمل و محصولات ورزشی
            </p>
          </div>

          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-all duration-300 hover:gap-3"
          >
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* ==================== گرید ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 auto-rows-[280px]">
          {promos.map((promo, index) => {
            const isLarge = index === 0;
            const IconComponent = iconMap[promo.icon] || Percent;

            return (
              <Link
                key={promo._id}
                href={promo.link}
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  ${isLarge ? "lg:col-span-2 lg:row-span-2" : ""}
                  shadow-md
                  hover:shadow-premium
                  transition-all
                  duration-500
                  hover:-translate-y-1
                `}
              >
                {/* تصویر */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={promo.image}
                    alt={`${promo.title} - ${promo.subtitle}`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* گرادیان طلایی-مشکی روی تصویر */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* افکت درخشش طلایی در هاور */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(212,160,17,0.25),transparent_50%)]" />

                {/* محتوا */}
                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  {/* بج */}
                  <div>
                    {promo.badge && (
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-primary/80 px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
                        {promo.badge}
                      </span>
                    )}
                  </div>

                  {/* محتوای پایین */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-xs md:text-sm mb-2 font-medium">
                          {promo.title}
                        </p>
                        <h3
                          className={`
                            font-black text-white leading-tight drop-shadow-md
                            ${isLarge ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"}
                          `}
                        >
                          {promo.subtitle}
                        </h3>
                      </div>

                      {/* آیکون */}
                      <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                        <IconComponent className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                      </div>
                    </div>

                    {/* دکمه CTA */}
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-300 group-hover:gap-3 group-hover:text-primary">
                      {promo.buttonText || "خرید با تخفیف"}
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* حاشیه طلایی در هاور */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-primary/40 transition-all duration-300" />
              </Link>
            );
          })}
        </div>

        {/* ==================== دکمه موبایل ==================== */}
        <div className="mt-6 flex md:hidden">
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 rounded-xl btn-gold px-5 py-4 text-sm font-bold shadow-md transition-all duration-300"
          >
            مشاهده همه محصولات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
