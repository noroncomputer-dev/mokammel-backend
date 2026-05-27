"use client";

import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface Feature {
  icon: any;
  title: string;
  description: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت کالا",
    description: "همراه با کد رجیستری قابل استعلام",
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    description: "۲۴ ساعته در تهران و ۲ تا ۴ روز در شهرستان",
  },
  {
    icon: RotateCcw,
    title: "بازگشت تا ۷ روز",
    description: "بدون سوال، وجه نقدی یا تعویض",
  },
  {
    icon: CreditCard,
    title: "پرداخت امن",
    description: "اتصال مستقیم به درگاه زرین‌پال",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-12 md:py-16 bg-background" dir="rtl">
      <div className="container mx-auto px-4">
        {/* ==================== گرید ویژگی‌ها ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {defaultFeatures.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-5 md:p-6 rounded-2xl 
                bg-card
                border border-border
                hover:border-primary/40
                shadow-sm hover:shadow-premium
                transition-all duration-300 
                hover:-translate-y-1"
            >
              {/* آیکون - طلایی */}
              <div
                className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl 
                  bg-primary/10
                  flex items-center justify-center mb-4 
                  group-hover:scale-110 transition-transform duration-300 
                  group-hover:bg-primary/20"
              >
                <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              </div>

              {/* عنوان - طلایی در هاور */}
              <h3 className="text-sm md:text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              {/* توضیحات */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* ==================== بج اعتماد پایین ==================== */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">
              بیش از ۱۰,۰۰۰ مشتری راضی
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
