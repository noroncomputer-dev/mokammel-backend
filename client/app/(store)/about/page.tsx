// app/(store)/about/page.tsx

import Link from "next/link";
import {
  ChevronLeft,
  Shield,
  Truck,
  Headphones,
  Users,
  Sparkles,
  Award,
  Heart,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ==================== بردکرامب ==================== */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            خانه
          </Link>
          <ChevronLeft size={14} className="text-muted-foreground" />
          <span className="text-foreground font-medium">درباره ما</span>
        </div>

        {/* ==================== هدر طلایی لوکس ==================== */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              آشنایی با ما
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            درباره <span className="gold-text">مکمل‌شاپ</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            فروشگاه تخصصی مکمل‌های ورزشی با هدف ارائه محصولات اورجینال و مشاوره
            تخصصی
          </p>
        </div>

        {/* ==================== محتوا - ماجرای ما ==================== */}
        <div className="bg-card rounded-3xl border border-border p-8 mb-12 shadow-sm">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-4">
                ماجرای <span className="text-primary">مکمل‌شاپ</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                مکمل‌شاپ در سال ۱۳۹۹ با هدف ارائه مکمل‌های ورزشی اصل و با کیفیت
                شروع به کار کرد. ما معتقدیم هر ورزشکاری حق دارد به بهترین و
                اصل‌ترین مکمل‌ها دسترسی داشته باشد.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                امروز بعد از ۵ سال فعالیت مستمر، به یکی از معتبرترین فروشگاه‌های
                آنلاین مکمل ورزشی در ایران تبدیل شده‌ایم و به هزاران ورزشکار
                حرفه‌ای و آماتور خدمات ارائه می‌دهیم.
              </p>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black gold-text">۱۵K+</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    مشتری راضی
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black gold-text">۸۵۰+</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    محصول
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black gold-text">۵+</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    سال تجربه
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 text-center border border-primary/20">
              <Award size={64} className="text-primary mx-auto mb-4" />
              <p className="text-foreground/80 font-medium leading-relaxed">
                تیم ما متشکل از کارشناسان تغذیه و ورزش است که با دانش و تجربه
                خود شما را در مسیر سلامتی همراهی می‌کنند.
              </p>
            </div>
          </div>
        </div>

        {/* ==================== چرا ما ==================== */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-all duration-300">
              <Shield size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              ضمانت اصالت
            </h3>
            <p className="text-muted-foreground text-sm">
              همه محصولات دارای کد رجیستری و ضمانت اصالت
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-all duration-300">
              <Truck size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              ارسال سریع
            </h3>
            <p className="text-muted-foreground text-sm">
              ارسال به سراسر کشور در کمترین زمان ممکن
            </p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-all duration-300">
              <Headphones size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
              پشتیبانی ۲۴/۷
            </h3>
            <p className="text-muted-foreground text-sm">
              مشاوره رایگان قبل و بعد از خرید
            </p>
          </div>
        </div>

        {/* ==================== Trust Badge پایین ==================== */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Heart className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              با عشق برای سلامتی شما
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
