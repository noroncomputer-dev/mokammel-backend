// app/(store)/categories/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Dumbbell,
  Flame,
  Heart,
  Battery,
  Brain,
  Pill,
  Sparkles,
} from "lucide-react";
import categoryService from "@/services/api/categories";

const categoryIcons: Record<string, any> = {
  protein: Dumbbell,
  muscle: Battery,
  fatburner: Flame,
  health: Heart,
  brain: Brain,
  vitamin: Pill,
  energy: Sparkles,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // داده‌های استاتیک برای نمایش
        setCategories([
          {
            _id: "1",
            name: "پروتئین",
            slug: "protein",
            productCount: 45,
            description: "بهترین پروتئین‌های وی، کازئین و گیاهی",
          },
          {
            _id: "2",
            name: "عضله‌سازی",
            slug: "muscle",
            productCount: 32,
            description: "کراتین، بی سی ای ای، گلوتامین و آمینو",
          },
          {
            _id: "3",
            name: "چربی‌سوز",
            slug: "fatburner",
            productCount: 28,
            description: "ترموژنیک، ال-کارنیتین، سی ال ای",
          },
          {
            _id: "4",
            name: "انرژی و تمرکز",
            slug: "energy",
            productCount: 18,
            description: "پری‌ورک‌اوت، کافئین، تaurine",
          },
          {
            _id: "5",
            name: "سلامت و تندرستی",
            slug: "health",
            productCount: 24,
            description: "ویتامین‌ها، مواد معدنی، امگا ۳",
          },
          {
            _id: "6",
            name: "مغز و حافظه",
            slug: "brain",
            productCount: 15,
            description: "تقویت حافظه و تمرکز",
          },
          {
            _id: "7",
            name: "ویتامین و مواد معدنی",
            slug: "vitamin",
            productCount: 20,
            description: "مولتی ویتامین، مواد معدنی ضروری",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* ==================== بردکرامب ==================== */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        <ChevronLeft size={14} />
        <span className="text-foreground font-medium">دسته‌بندی‌ها</span>
      </div>

      {/* ==================== هدر ==================== */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
            دسته‌بندی محصولات
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black gold-text mb-4">
          دسته‌بندی محصولات
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          مکمل مناسب خود را بر اساس نیاز و هدف ورزشی‌تان پیدا کنید
        </p>
      </div>

      {/* ==================== لیست دسته‌بندی‌ها ==================== */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-6 animate-pulse border border-border"
            >
              <div className="w-16 h-16 bg-muted/50 rounded-2xl mb-4" />
              <div className="h-6 bg-muted/50 rounded-lg w-3/4 mb-2" />
              <div className="h-4 bg-muted/50 rounded-lg w-full mb-4" />
              <div className="h-10 bg-muted/50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] || Dumbbell;
            return (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-medium">
                        {category.productCount || 0} محصول
                      </span>
                      <span className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all duration-300">
                        مشاهده →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
