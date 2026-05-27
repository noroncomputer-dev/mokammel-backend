"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Zap,
  Flame,
  Pill,
  Heart,
  Plus,
  ArrowLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import categoryService, { Category } from "@/services/api/categories";
import productService from "@/services/api/products";

// نقشه آیکون‌ها بر اساس slug دسته‌بندی
const iconMap: Record<string, any> = {
  protein: Dumbbell,
  creatine: Zap,
  "fat-burner": Flame,
  bcaa: Pill,
  wellness: Heart,
  vitamins: Pill,
  energy: Zap,
  "pre-workout": Zap,
  "mass-gainer": Plus,
  default: Dumbbell,
};

// نقشه رنگ آیکون‌ها
const colorMap: Record<string, string> = {
  protein: "bg-primary",
  creatine: "bg-amber-500",
  "fat-burner": "bg-orange-500",
  bcaa: "bg-emerald-500",
  wellness: "bg-rose-500",
  vitamins: "bg-emerald-500",
  energy: "bg-amber-500",
  "pre-workout": "bg-orange-500",
  "mass-gainer": "bg-primary/50",
  default: "bg-primary/50",
};

export default function CategoryFinder() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getActiveCategories();
      setCategories(data);

      // دریافت تعداد محصولات هر دسته‌بندی
      const counts: Record<string, number> = {};
      for (const cat of data) {
        try {
          const products = await productService.getProducts({
            category: cat._id,
            limit: 1,
          });
          const total = products.pagination?.total || products.total || 0;
          counts[cat._id] = total;
        } catch (err) {
          counts[cat._id] = 0;
        }
      }
      setProductCounts(counts);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("خطا در دریافت دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (slug: string) => {
    return iconMap[slug] || iconMap.default;
  };

  const getColorForCategory = (slug: string) => {
    return colorMap[slug] || colorMap.default;
  };

  const getProductCount = (categoryId: string) => {
    return productCounts[categoryId] || 0;
  };

  const formatProductCount = (count: number) => {
    if (count === 0) return "به زودی";
    if (count > 100) return "۱۰۰+ محصول";
    return `${count} محصول`;
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden py-20 bg-muted/30" dir="rtl">
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

  if (error) {
    return (
      <section className="relative overflow-hidden py-20 bg-muted/30" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-rose-500">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-4 btn-gold px-6 py-2 text-sm"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-20 bg-muted/30" dir="rtl">
      {/* ==================== پس‌زمینه محو ==================== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-primary/10 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[280px] h-[280px] bg-primary/8 blur-[60px] rounded-full" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* ==================== هدر ==================== */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                دسته‌بندی محصولات
              </span>
            </div>
            <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-foreground">
              انتخاب سریع مکمل <span className="gold-text">مورد نیاز</span>
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl leading-7">
              مکمل مناسب هدف تمرینی خودت رو سریع پیدا کن؛ از عضله‌سازی و ریکاوری
              تا چربی‌سوزی.
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 hover:gap-3 transition-all duration-300"
          >
            مشاهده همه <ArrowLeft size={16} />
          </Link>
        </div>

        {/* ==================== کارت‌های دسته‌بندی ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = getIconForCategory(cat.slug);
            const iconColor = getColorForCategory(cat.slug);
            const productCount = getProductCount(cat._id);

            return (
              <Link
                key={cat._id}
                href={`/products?category=${cat.slug}`}
                className="group"
              >
                <div
                  className="
                    relative h-full overflow-hidden rounded-2xl
                    border border-border
                    bg-card
                    p-5
                    transition-all duration-300
                    hover:-translate-y-1.5
                    hover:border-primary/30
                    hover:shadow-premium
                  "
                >
                  {/* افکت درخشش در هاور */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl`}
                  />

                  <div className="relative z-10">
                    {/* آیکون */}
                    <div
                      className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={22} strokeWidth={2.3} />
                    </div>

                    {/* متن */}
                    <div className="mt-4">
                      <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors duration-300">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatProductCount(productCount)}
                      </p>
                    </div>

                    {/* لینک */}
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary group-hover:gap-2.5 transition-all duration-300">
                      مشاهده <ArrowLeft size={13} />
                    </div>
                  </div>

                  {/* حاشیه درخشان */}
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 group-hover:ring-primary/20 transition duration-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* ==================== بنر پایین CTA ==================== */}
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-card/80 p-8 md:p-10 shadow-premium">
          {/* افکت درخشش */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary/8 blur-[60px] rounded-full" />

          {/* گرید خطوط */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212,160,17,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,17,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                  مشاوره تخصصی مکمل
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                نمی‌دونی چه مکملی مناسبته؟
              </h3>
              <p className="mt-4 text-sm md:text-base text-muted-foreground leading-7 max-w-xl">
                بر اساس هدف تمرینی، بودجه و سطح فعالیتت بهترین مکمل‌ها رو انتخاب
                کن.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {[
                  "افزایش حجم عضله",
                  "چربی‌سوزی",
                  "ریکاوری سریع",
                  "افزایش انرژی",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/categories"
              className="shrink-0 btn-gold inline-flex items-center gap-2.5 rounded-xl px-7 py-4 text-sm font-black shadow-gold hover:shadow-gold-strong transition-all duration-300"
            >
              شروع انتخاب <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
