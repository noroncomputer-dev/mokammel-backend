// app/(store)/contact/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: اتصال به API ارسال پیام
    setTimeout(() => {
      toast.success("پیام شما با موفقیت ارسال شد");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ==================== بردکرامب ==================== */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            خانه
          </Link>
          <ChevronLeft size={14} className="text-muted-foreground" />
          <span className="text-foreground font-medium">تماس با ما</span>
        </div>

        {/* ==================== هدر طلایی لوکس ==================== */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              ارتباط با ما
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            تماس با <span className="gold-text">مکمل‌شاپ</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ما همیشه در دسترس هستیم. سوالات، پیشنهادات و انتقادات شما را
            می‌شنویم.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ==================== اطلاعات تماس ==================== */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                  <Phone size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">تلفن پشتیبانی</h3>
                  <p className="text-muted-foreground">۰۲۱-۹۱۰۰۰۰۰۰</p>
                  <p className="text-xs text-muted-foreground/70">
                    شنبه تا چهارشنبه ۹ تا ۱۷
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Mail size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">ایمیل</h3>
                  <p className="text-muted-foreground">info@mokammel.ir</p>
                  <p className="text-xs text-muted-foreground/70">
                    پاسخگویی ظرف ۲۴ ساعت
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MapPin size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">آدرس</h3>
                  <p className="text-muted-foreground">
                    تهران، سعادت‌آباد، خیابان ۲۴متری
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    پلاک ۱۲، واحد ۳
                  </p>
                </div>
              </div>
            </div>

            {/* ساعات کاری */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} className="text-primary" />
                <h3 className="font-bold text-foreground">ساعات کاری</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>شنبه تا چهارشنبه: ۹:۰۰ - ۱۷:۰۰</p>
                <p>پنجشنبه: ۹:۰۰ - ۱۳:۰۰</p>
                <p>جمعه: تعطیل</p>
              </div>
            </div>
          </div>

          {/* ==================== فرم تماس طلایی ==================== */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-black gold-text mb-6">ارسال پیام</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="علی رضایی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    موضوع
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مشاوره، خرید، انتقاد، پیشنهاد..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    پیام
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl btn-gold font-bold flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-strong transition-all duration-300 disabled:opacity-50"
                >
                  <Send size={18} />
                  {loading ? "در حال ارسال..." : "ارسال پیام"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
