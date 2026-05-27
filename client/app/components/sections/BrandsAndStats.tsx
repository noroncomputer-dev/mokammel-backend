"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Package, Clock, Star, Sparkles } from "lucide-react";
import brandService, { Brand } from "@/services/api/brands";
import statsService from "@/services/api/stats";

interface StatItem {
  icon: any;
  key: string;
  label: string;
  suffix: string;
  targetValue: number;
  currentValue: number;
}

export default function BrandsAndStats() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    shippingTime: 0,
    avgRating: 0,
  });

  // تعریف آیتم‌های آمار
  const statItems = [
    { icon: Users, key: "totalUsers", label: "مشتری راضی", suffix: "K+" },
    { icon: Package, key: "totalProducts", label: "محصول متنوع", suffix: "+" },
    { icon: Clock, key: "shippingTime", label: "ارسال سریع", suffix: "h" },
    { icon: Star, key: "avgRating", label: "امتیاز کاربران", suffix: "/5" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // تشخیص دیده شدن بخش با IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible && !loading) {
          setIsVisible(true);
          startCounting();
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [loading, isVisible]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [brandsData, statsData] = await Promise.all([
        brandService.getActiveBrands(),
        statsService.getHomeStats().catch(() => null),
      ]);

      setBrands(brandsData.slice(0, 8));
      setStats(statsData);

      // ذخیره مقادیر هدف
      setAnimatedStats({
        totalUsers: statsData?.totalUsers || 15000,
        totalProducts: statsData?.totalProducts || 850,
        shippingTime: statsData?.shippingTime || 24,
        avgRating: statsData?.avgRating || 4.9,
      });
    } catch (err: any) {
      console.error("Error fetching brands data:", err);
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // تابع شمارشگر
  const startCounting = () => {
    const duration = 2000; // 2 ثانیه
    const stepTime = 20; // 20 میلی‌ثانیه
    const steps = duration / stepTime;

    const targets = {
      totalUsers: stats?.totalUsers || 15000,
      totalProducts: stats?.totalProducts || 850,
      shippingTime: stats?.shippingTime || 24,
      avgRating: stats?.avgRating || 4.9,
    };

    const increments = {
      totalUsers: targets.totalUsers / steps,
      totalProducts: targets.totalProducts / steps,
      shippingTime: targets.shippingTime / steps,
      avgRating: targets.avgRating / steps,
    };

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setAnimatedStats({
        totalUsers: Math.min(
          Math.floor(increments.totalUsers * currentStep),
          targets.totalUsers,
        ),
        totalProducts: Math.min(
          Math.floor(increments.totalProducts * currentStep),
          targets.totalProducts,
        ),
        shippingTime: Math.min(
          Math.floor(increments.shippingTime * currentStep),
          targets.shippingTime,
        ),
        avgRating: Math.min(
          parseFloat((increments.avgRating * currentStep).toFixed(1)),
          targets.avgRating,
        ),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({
          totalUsers: targets.totalUsers,
          totalProducts: targets.totalProducts,
          shippingTime: targets.shippingTime,
          avgRating: targets.avgRating,
        });
      }
    }, stepTime);
  };

  // فرمت کردن مقادیر آمار
  const formatStatValue = (value: number, suffix: string, key: string) => {
    if (key === "avgRating") {
      return value.toFixed(1);
    }
    if (suffix === "K+") {
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K+`;
      return `${value}+`;
    }
    if (suffix === "+") return `${value}+`;
    if (suffix === "h") return `${value}h`;
    if (suffix === "/5") return value.toFixed(1);
    return value.toLocaleString("fa-IR");
  };

  const getBrandInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <section
        className="py-16 bg-background border-y border-border/40"
        dir="rtl"
      >
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
      <section
        className="py-16 bg-background border-y border-border/40"
        dir="rtl"
      >
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-rose-500">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 btn-gold px-6 py-2 text-sm"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-16 bg-background border-y border-border/40 transition-colors duration-300"
      dir="rtl"
    >
      <div className="container mx-auto px-4 space-y-16">
        {/* ==================== برندها ==================== */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              برندهای معتبر
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2 mt-3">
            نمایندگی رسمی <span className="gold-text">برترین برندهای دنیا</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm mb-10 leading-7">
            مستقیم از نمایندگی‌های رسمی آمریکا، اروپا و آسیا. بدون واسطه، با
            ضمانت اصالت کامل.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {brands.map((brand) => (
              <div
                key={brand._id}
                className="
                  group bg-card border border-border/50 rounded-2xl p-6
                  hover:border-primary/30
                  hover:shadow-[0_8px_28px_rgba(186,144,12,0.10)]
                  dark:hover:shadow-[0_8px_28px_rgba(212,160,17,0.12)]
                  transition-all duration-300 hover:-translate-y-1 cursor-pointer
                "
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="
                    w-12 h-12 bg-muted rounded-xl border border-border/60
                    flex items-center justify-center font-black text-base text-foreground
                    group-hover:bg-primary group-hover:text-primary-foreground
                    group-hover:border-primary group-hover:shadow-gold
                    transition-all duration-300
                  "
                  >
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      getBrandInitials(brand.name)
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg border border-border/40">
                    {brand.origin || "جهانی"}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1 text-right">
                  {brand.name}
                </h3>
                <p className="text-xs text-muted-foreground">برند معتبر</p>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== آمار با انیمیشن شمارشگر ==================== */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card to-card/80">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute right-[-10%] top-[-30%] w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute left-[-10%] bottom-[-30%] w-72 h-72 bg-primary/8 rounded-full blur-[60px]" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(212,160,17,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,17,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/20 divide-x-reverse">
            {statItems.map((stat) => {
              let currentValue = 0;
              if (stat.key === "totalUsers")
                currentValue = animatedStats.totalUsers;
              if (stat.key === "totalProducts")
                currentValue = animatedStats.totalProducts;
              if (stat.key === "shippingTime")
                currentValue = animatedStats.shippingTime;
              if (stat.key === "avgRating")
                currentValue = animatedStats.avgRating;

              return (
                <div
                  key={stat.key}
                  className="p-8 text-center group hover:bg-primary/5 transition-all duration-300"
                >
                  <div
                    className="
                    w-14 h-14 mx-auto mb-4
                    bg-primary/10 text-primary rounded-2xl
                    border border-primary/20
                    flex items-center justify-center
                    group-hover:scale-110 group-hover:shadow-glow
                    transition-all duration-300
                  "
                  >
                    <stat.icon size={24} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold mb-1.5 tracking-tight gold-text">
                    {isVisible
                      ? formatStatValue(currentValue, stat.suffix, stat.key)
                      : stat.key === "avgRating"
                        ? "0.0"
                        : "0"}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
