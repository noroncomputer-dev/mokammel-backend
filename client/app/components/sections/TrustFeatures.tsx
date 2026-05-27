"use client";

import { QrCode, BadgeCheck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";

const features = [
  { icon: QrCode,      title: "QR Code",        desc: "روی هر محصول" },
  { icon: BadgeCheck,  title: "گواهی اصالت",    desc: "برای هر خرید" },
  { icon: RotateCcw,   title: "۷ روز مرجوعی",  desc: "بدون سوال" },
  { icon: Headphones,  title: "پشتیبانی ۲۴/۷", desc: "همیشه در دسترس" },
];

export default function TrustFeatures() {
  return (
    <section className="py-14 bg-background" dir="rtl">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="badge-gold mb-4 inline-flex">
            <ShieldCheck size={13} /> ضمانت اصالت
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-foreground mt-4">
            هر محصول با کد رجیستری{" "}
            <span className="gold-text">اورجینال</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto leading-7 text-sm md:text-base">
            تمام محصولات مکمل‌شاپ مستقیم از نمایندگی رسمی تهیه می‌شوند.
            هر محصول دارای QR Code و کد رجیستری قابل استعلام است.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <div
              key={i}
              className="
                group text-center p-6 rounded-2xl cursor-default
                bg-card border border-border/50
                hover:border-primary/30
                hover:shadow-[0_8px_30px_rgba(186,144,12,0.08)]
                dark:hover:shadow-[0_8px_30px_rgba(212,160,17,0.10)]
                transition-all duration-300
              "
            >
              <div className="
                w-14 h-14 mx-auto mb-4 rounded-2xl
                bg-gold-50 dark:bg-gold-950/20
                text-primary
                flex items-center justify-center
                border border-primary/15
                group-hover:scale-110 group-hover:shadow-gold
                transition-all duration-300
              ">
                <feature.icon size={26} />
              </div>
              <h3 className="font-bold text-foreground text-base">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 btn-gold px-8 py-4 rounded-2xl text-sm font-bold cursor-default shadow-gold">
            <ShieldCheck size={19} />
            ۱۰۰٪ تضمین اصالت کالا
          </div>
        </div>
      </div>
    </section>
  );
}
