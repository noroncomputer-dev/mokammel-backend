"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Tag,
  Loader2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
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

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const fetchSlides = async () => {
    try {
      const response = await api.get("/sliders/active");
      if (response.data.success) setSlides(response.data.data.slides);
    } catch (error) {
      console.error("Error fetching slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 md:h-[500px] bg-gray-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          <p className="text-sm text-gray-400 dark:text-gray-600">
            در حال بارگذاری...
          </p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const active = slides[current];

  return (
    <section className="relative w-full overflow-hidden" dir="rtl">
      {/* پس‌زمینه - لایت مود روشن، دارک مود مشکی عمیق */}
      <div className="relative bg-gray-50 dark:bg-black min-h-[420px] md:min-h-[520px] transition-colors duration-300">
        {/* گرادینت‌های محیطی */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-gold-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-14 md:py-20 flex items-center min-h-[420px] md:min-h-[520px]">
          <div className="grid md:grid-cols-2 gap-10 items-center w-full">
            {/* محتوای متنی */}
            <div className="space-y-6 order-2 md:order-1">
              {/* برچسب */}
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400">
                <Sparkles size={12} />
                پیشنهاد ویژه
              </span>

              {/* عنوان */}
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-gray-900 dark:text-white">
                {active.title}
              </h1>

              {/* زیرنویس */}
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-7 max-w-md">
                {active.subtitle}
              </p>

              {/* دکمه‌ها */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* دکمه اصلی طلایی لوکس */}
                <Link
                  href={active.link}
                  className="relative group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold 
                    bg-gradient-to-r from-gold-500 to-gold-600 
                    hover:from-gold-600 hover:to-gold-700 
                    text-white shadow-md 
                    hover:shadow-lg hover:shadow-gold-500/25 
                    transition-all duration-300 
                    active:scale-95
                    overflow-hidden"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500" />
                  <span className="relative z-10">{active.buttonText}</span>
                  <ArrowLeft
                    size={18}
                    className="relative z-10 group-hover:-translate-x-1 transition-transform duration-200"
                  />
                </Link>

                {/* دکمه ثانویه - مشاهده همه */}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold 
                    border-2 border-gold-500 
                    text-gold-600 dark:text-gold-400 
                    hover:bg-gold-500/10 dark:hover:bg-gold-500/20 
                    hover:border-gold-600 dark:hover:border-gold-400
                    transition-all duration-200 
                    active:scale-95"
                >
                  مشاهده همه
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>

            {/* تصویر */}
            <div className="relative flex items-center justify-center order-1 md:order-2 min-h-[260px]">
              {/* حلقه‌های تزئینی */}
              <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-gold-500/20" />
              <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-gold-500/30" />
              <div className="absolute w-48 h-48 md:w-64 md:h-64 bg-gold-500/10 rounded-full blur-3xl" />

              {/* ظرف تصویر */}
              <div className="relative z-10 w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={active.image}
                  alt={active.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                {/* اوورلی طلایی */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* دکمه‌های ناوبری */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}

        {/* نقاط ناوبری */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  current === i
                    ? "w-6 h-2 bg-gold-500"
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gold-400"
                }`}
              />
            ))}
          </div>
        )}

        {/* گرادینت پایین */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-black to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
