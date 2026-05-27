"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "../ui/ProductCard";
import SectionHeader from "../ui/SectionHeader";
import productService, { Product } from "@/services/api/products";
import { Sparkles } from "lucide-react";

// ==================== توابع کمکی ایمن ====================
const getBrandName = (brand: any): string => {
  if (!brand) return "بدون برند";
  if (typeof brand === "string") return brand || "بدون برند";
  if (typeof brand === "object" && brand !== null) {
    return brand.name || "بدون برند";
  }
  return "بدون برند";
};

const getImageUrl = (product: Product): string => {
  if (product.images?.[0]) {
    const img = product.images[0];
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      return `${baseUrl}${img}`;
    }
    return img;
  }
  return "/placeholder-image.jpg";
};

// ==================== کامپوننت اسکلتون ====================
const SkeletonCard = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-pulse">
    <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/30" />
    <div className="p-4 space-y-3">
      <div className="h-2.5 bg-muted/60 rounded-full w-16" />
      <div className="h-4 bg-muted/60 rounded-full w-5/6" />
      <div className="h-4 bg-muted/60 rounded-full w-3/5" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-muted/60 rounded-full w-24" />
        <div className="h-8 bg-muted/60 rounded-xl w-16" />
      </div>
    </div>
  </div>
);

// ==================== کامپوننت اصلی ====================
export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // ==================== دریافت محصولات ویژه ====================
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await productService.getFeaturedProducts(6);

        // ✅ اگر دیتا خالی بود یا خطا داشت
        if (data && Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error("Error fetching featured products:", err);
        // ✅ اگر خطای 400 بود و محصولی وجود ندارد، خطا نده
        if (err.response?.status === 400) {
          setProducts([]);
        } else {
          setError(err.response?.data?.message || "خطا در دریافت محصولات ویژه");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // ==================== فرمت محصول برای کارت ====================
  const formatProductForCard = (product: Product) => {
    const discount =
      product.discountPrice && product.discountPrice > 0
        ? Math.round(
            ((product.price - product.discountPrice) / product.price) * 100,
          )
        : 0;

    return {
      id: product._id,
      slug: product.slug,
      name: product.name,
      brand: getBrandName(product.brand),
      price: product.price,
      oldPrice: product.discountPrice,
      image: getImageUrl(product),
      discount,
      rating: product.rating || 0,
      reviews: product.reviewCount || 0,
      stock: product.stock || 0,
      isFeatured: product.isFeatured,
    };
  };

  // ==================== نمایش خطا ====================
  if (error) {
    return (
      <section className="py-16 bg-muted/30" dir="rtl">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="محصولات ویژه"
            subtitle="برترین مکمل‌های این ماه"
            linkHref="/products"
          />
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 mb-3">
              <Sparkles className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-rose-500 dark:text-rose-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-gold-outline px-4 py-2 text-sm"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ==================== بدون محصول ====================
  if (!loading && products.length === 0) {
    return null;
  }

  // ==================== رندر اصلی ====================
  return (
    <section ref={sectionRef} className="py-16 bg-muted/30" dir="rtl">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="محصولات ویژه"
          subtitle="برترین مکمل‌های این ماه با بهترین قیمت و ضمانت اصالت"
          linkHref="/products"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={formatProductForCard(product)}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
