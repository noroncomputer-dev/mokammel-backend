// app/components/layout/Footer.tsx

import { Phone, Mail, MapPin, ShieldCheck, Send } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="
        bg-obsidian-950 dark:bg-[#080806]
        text-obsidian-300
        border-t border-gold-900/30
        pt-16 pb-8
        transition-colors duration-500
      "
    >
      <div className="container mx-auto px-4">
        {/* ─── Gold top divider ─── */}
        <div className="h-px w-full bg-gradient-to-l from-transparent via-gold-600/40 to-transparent mb-16" />

        {/* ─── Main grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Col 1: Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-gold">
                <span className="text-primary-foreground font-black text-sm">
                  M
                </span>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">
                  مکمل‌شاپ
                </p>
                <p className="text-gold-600 text-[10px] tracking-widest font-medium uppercase">
                  Mokammel.ir
                </p>
              </div>
            </div>

            <p className="text-sm leading-7 text-obsidian-400">
              فروشگاه تخصصی مکمل‌های ورزشی با ضمانت اصالت کالا و مشاوره رایگان.
              همراه شما در مسیر قهرمانی از سال ۱۳۹۸.
            </p>

            <div className="flex gap-3">
              {[
                { label: "IG", Icon: "s" },
                { label: "TG", Icon: Send },
                { label: "TW", Icon: null },
              ].map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  className="
                    w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold
                    bg-obsidian-900 text-obsidian-400
                    border border-obsidian-800
                    hover:bg-primary/10 hover:text-primary hover:border-primary/40
                    transition-all duration-300
                  "
                >
                  {Icon ? <Icon size={16} /> : label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick links */}
          <div>
            <h3 className="text-white font-bold mb-5 text-base flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block rounded-full" />
              دسترسی سریع
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "محصولات جدید",
                "تخفیف‌ها و پیشنهادات",
                "برندهای معتبر",
                "مقالات آموزشی",
                "ماشین حساب BMI",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-obsidian-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-700 group-hover:bg-primary transition-colors shrink-0" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer service */}
          <div>
            <h3 className="text-white font-bold mb-5 text-base flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block rounded-full" />
              خدمات مشتریان
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                "پیگیری سفارش",
                "شرایط بازگشت کالا",
                "سوالات متداول",
                "حریم خصوصی",
                "تماس با پشتیبانی",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-obsidian-400 hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-700 group-hover:bg-primary transition-colors shrink-0" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h3 className="text-white font-bold mb-5 text-base flex items-center gap-2">
              <span className="w-5 h-0.5 bg-primary inline-block rounded-full" />
              تماس با ما
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="text-obsidian-400 leading-6">
                  تهران، سعادت‌آباد، بلوار دریا، پلاک ۱۲۳
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <span className="text-obsidian-400">
                  ۰۲۱-۹۱۰۰۰۰۰ (پشتیبانی ۲۴ ساعته)
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="text-obsidian-400">info@mokammel.ir</span>
              </li>
            </ul>

            {/* Trust badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-900 border border-gold-800/40">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-xs text-gold-400 font-semibold">
                پرداخت ۱۰۰٪ امن
              </span>
            </div>
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="border-t border-obsidian-800 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-obsidian-500">
          <p>© ۱۴۰۴ مکمل‌شاپ. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary transition-colors">
              قوانین و مقررات
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              حریم خصوصی
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
