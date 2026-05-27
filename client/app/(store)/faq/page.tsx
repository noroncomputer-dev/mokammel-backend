// app/(store)/faq/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    category: "خرید و سفارش",
    items: [
      {
        q: "چگونه می‌توانم سفارش خود را ثبت کنم؟",
        a: "برای ثبت سفارش کافی است محصول مورد نظر را به سبد خرید اضافه کنید، سپس اطلاعات ارسال را وارد کرده و در نهایت پرداخت را انجام دهید.",
      },
      {
        q: "آیا امکان لغو سفارش وجود دارد؟",
        a: "بله، تا قبل از ارسال سفارش می‌توانید با تماس با پشتیبانی سفارش خود را لغو کنید.",
      },
      {
        q: "حداقل مبلغ خرید برای ارسال رایگان چقدر است؟",
        a: "برای سفارشات بالای ۲ میلیون تومان، ارسال رایگان است.",
      },
    ],
  },
  {
    category: "پرداخت و فاکتور",
    items: [
      {
        q: "روش‌های پرداخت چیست؟",
        a: "پرداخت از طریق درگاه بانکی زرین‌پال با تمام کارت‌های عضو شتاب امکان‌پذیر است.",
      },
      {
        q: "آیا امکان پرداخت در محل وجود دارد؟",
        a: "بله، برای شهر تهران امکان پرداخت در محل وجود دارد.",
      },
      {
        q: "چگونه فاکتور رسمی دریافت کنم؟",
        a: "برای دریافت فاکتور رسمی، پس از ثبت سفارش با پشتیبانی تماس بگیرید.",
      },
    ],
  },
  {
    category: "ارسال و تحویل",
    items: [
      {
        q: "زمان تحویل سفارش چقدر است؟",
        a: "سفارشات تهران ظرف ۲۴ ساعت و شهرستان‌ها ۲ تا ۴ روز کاری تحویل می‌شوند.",
      },
      {
        q: "هزینه ارسال چگونه محاسبه می‌شود؟",
        a: "هزینه ارسال بر اساس وزن و مقصد محاسبه می‌شود و در صفحه تسویه حساب نمایش داده می‌شود.",
      },
    ],
  },
  {
    category: "محصولات و گارانتی",
    items: [
      {
        q: "ضمانت اصالت کالا چگونه است؟",
        a: "همه محصولات دارای کد رجیستری و ضمانت اصالت هستند. می‌توانید اصالت کالا را از طریق سایت‌های معتبر استعلام کنید.",
      },
      {
        q: "اگر محصول معیوب باشد چه کار کنم؟",
        a: "در صورت معیوب بودن کالا، تا ۷ روز پس از تحویل می‌توانید مرجوع کنید.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-4 flex items-center justify-between text-right hover:text-primary transition-all duration-200 group"
      >
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
          {q}
        </span>
        {open ? (
          <ChevronUp
            size={18}
            className="text-primary transition-transform duration-200"
          />
        ) : (
          <ChevronDown
            size={18}
            className="text-muted-foreground group-hover:text-primary transition-all duration-200"
          />
        )}
      </button>
      {open && (
        <div className="pb-4 text-muted-foreground leading-relaxed text-sm">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background transition-colors" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ==================== بردکرامب ==================== */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            خانه
          </Link>
          <ChevronLeft size={14} className="text-muted-foreground" />
          <span className="text-foreground font-medium">سوالات متداول</span>
        </div>

        {/* ==================== هدر طلایی لوکس ==================== */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              راهنمای شما
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            سوالات <span className="gold-text">متداول</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            پاسخ سوالات رایج شما درباره خرید، پرداخت، ارسال و محصولات
          </p>
        </div>

        {/* ==================== سوالات ==================== */}
        <div className="space-y-6">
          {faqs.map((category) => (
            <div
              key={category.category}
              className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-premium transition-all duration-300"
            >
              <h2 className="text-xl font-black gold-text mb-4 pb-2 border-b border-border">
                {category.category}
              </h2>
              <div>
                {category.items.map((item, idx) => (
                  <FAQItem key={idx} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ==================== تماس با ما ==================== */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">سوال دیگری دارید؟</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            با ما در تماس باشید، خوشحال می‌شویم کمک کنیم.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-xl btn-gold font-bold transition-all duration-300 shadow-gold hover:shadow-gold-strong"
          >
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  );
}
