"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api/axios";

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
  buttonText: string;
  isActive: boolean;
}

const FALLBACK: Slide[] = [
  {
    _id: "f1",
    title: "slide 1",
    subtitle: "",
    image: "/banners/banner1.jpg",
    link: "/products",
    order: 1,
    buttonText: "مشاهده محصولات",
    isActive: true,
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dir, setDir] = useState<1 | -1>(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/sliders/active");
        const list: Slide[] = res.data?.data?.slides ?? res.data?.data ?? [];
        setSlides(list.length ? list : FALLBACK);
      } catch {
        setSlides(FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [slides.length, current]);

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      setCurrent((p) => (p + d + slides.length) % slides.length);
    },
    [slides.length],
  );

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-b from-gray-900 to-black"
        style={{ height: "clamp(160px, 48vw, 640px)" }}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!slides.length) return null;

  const slide = slides[current];

  const imgV = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] },
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d > 0 ? -80 : 80,
      transition: { duration: 0.45, ease: "easeIn" },
    }),
  };

  return (
    <section className="relative w-full py-8 bg-background" dir="rtl">
      {/* کانتینر با عرض 70% و حاشیه‌های خالی */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        <div
          className="relative w-full overflow-hidden rounded-2xl shadow-luxury"
          style={{ height: "clamp(160px, 48vw, 640px)" }}
        >
          {/* تصویر با fit-contain و پس‌زمینه مشکی */}
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={slide._id}
              custom={dir}
              variants={imgV}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full overflow-hidden bg-black"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-contain object-cover"
                draggable={false}
              />
              {/* گرادیان ملایم پایین برای خوانایی دکمه */}
              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* محتوای متنی (اختیاری) */}
          {(slide.title || slide.subtitle) && (
            <div className="absolute top-6 right-6 md:right-8 z-20 text-right">
              {slide.title && (
                <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold gold-text drop-shadow-lg">
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className="text-white/80 text-sm md:text-base max-w-md drop-shadow-md">
                  {slide.subtitle}
                </p>
              )}
            </div>
          )}

          {/* دکمه مشاهده محصولات - پایین سمت چپ */}
          <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-4 sm:left-5 md:left-6 z-20">
            <Link
              href={slide.link}
              className="btn-gold inline-flex items-center gap-2 text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3 shadow-gold hover:shadow-gold-strong"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {slide.buttonText || "مشاهده محصولات"}
            </Link>
          </div>

          {/* فلش راست (قبلی) */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="قبلی"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                           w-9 h-9 sm:w-11 sm:h-11 rounded-full
                           bg-black/40 hover:bg-primary/80
                           backdrop-blur-sm border border-white/20
                           flex items-center justify-center text-white
                           transition-all duration-300 hover:scale-110 hover:shadow-glow
                           group"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="بعدی"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                           w-9 h-9 sm:w-11 sm:h-11 rounded-full
                           bg-black/40 hover:bg-primary/80
                           backdrop-blur-sm border border-white/20
                           flex items-center justify-center text-white
                           transition-all duration-300 hover:scale-110 hover:shadow-glow
                           group"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}

          {/* نقاط ناوبری طلایی */}
          {slides.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDir(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  aria-label={`اسلاید ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 h-2 bg-primary shadow-glow"
                      : "w-2 h-2 bg-white/40 hover:bg-primary/60 hover:scale-110"
                  }`}
                />
              ))}
            </div>
          )}

          {/* نوار پیشرفت طلایی */}
          {slides.length > 1 && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-20">
              <motion.div
                key={current}
                className="h-full bg-gradient-to-r from-primary/80 to-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
