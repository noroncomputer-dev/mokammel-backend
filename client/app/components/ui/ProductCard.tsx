"use client";

import { Star, ShoppingCart, Heart, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";
import { useState } from "react";

const formatPrice = (price: number) => price?.toLocaleString("fa-IR") || "۰";

interface ProductProps {
  id?: string;
  _id?: string;
  slug: string;
  name?: string;
  title?: string;
  brand?: string | { _id: string; name: string; logo?: string };
  price: number;
  oldPrice?: number;
  image?: string;
  images?: string[];
  discount?: number;
  rating?: number;
  reviews?: number;
  reviewsCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  stock?: number;
}

export default function ProductCard({ product }: { product: ProductProps }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);

  const productId = product.id || product._id || "";
  const productName = product.name || product.title || "بدون نام";

  let imageSrc = "/placeholder-image.jpg";
  if (!imgError) {
    if (product.image?.trim()) imageSrc = product.image;
    else if (product.images?.length && product.images[0])
      imageSrc = product.images[0];
  }

  if (
    imageSrc &&
    !imageSrc.startsWith("http") &&
    !imageSrc.startsWith("//") &&
    imageSrc !== "/placeholder-image.jpg"
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    imageSrc = `${baseUrl}${imageSrc.startsWith("/") ? "" : "/"}${imageSrc}`;
  }

  let brandName = "بدون برند";
  if (product.brand) {
    if (typeof product.brand === "string") brandName = product.brand;
    else if (product.brand.name) brandName = product.brand.name;
  }

  const reviewsCount = product.reviews || product.reviewsCount || 0;
  const rating = product.rating || 0;
  const stock = product.stock ?? 99;
  const isLowStock = stock > 0 && stock < 5;
  const isOutOfStock = stock === 0;

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : product.discount;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("این محصول موجود نیست");
      return;
    }

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    addItem({
      productId,
      name: productName,
      price: product.price,
      image: imageSrc,
      quantity: 1,
      stock,
    });

    toast.success(`${productName} به سبد خرید اضافه شد`);
    setIsAdding(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
    toast.success(
      isWishlist ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد",
    );
  };

  return (
    <div
      className="
      group bg-card rounded-2xl border border-border overflow-hidden
      hover:border-primary/40
      hover:shadow-[0_20px_40px_-12px_rgba(186,144,12,0.15)]
      dark:hover:shadow-[0_20px_40px_-12px_rgba(212,160,17,0.2)]
      transition-all duration-400
      relative flex flex-col h-full
      cursor-pointer
    "
    >
      {/* ─── Badges طلایی لوکس ─── */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {discountPercent ? (
          <span className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-glow">
            {discountPercent}٪ تخفیف
          </span>
        ) : null}
        {product.isNew && (
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            جدید
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
            <TrendingUp size={10} /> پرفروش
          </span>
        )}
        {isLowStock && (
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            موجودی محدود
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-gradient-to-r from-gray-500 to-gray-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
            ناموجود
          </span>
        )}
      </div>

      {/* ─── Wishlist ─── */}
      <button
        onClick={handleWishlist}
        className="
          absolute top-3 left-3 z-10 w-8 h-8
          bg-card rounded-full
          flex items-center justify-center
          text-muted-foreground hover:text-rose-500
          border border-border hover:border-rose-300/50
          transition-all duration-300
          opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
        "
      >
        <Heart
          size={15}
          className={isWishlist ? "fill-rose-500 text-rose-500" : ""}
        />
      </button>

      {/* ─── Image - تمام عرض بدون حاشیه ─── */}
      <Link
        href={`/product/${product.slug}`}
        className="block w-full overflow-hidden bg-muted/20"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={imageSrc}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        </div>
      </Link>

      {/* ─── Info ─── */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand & Badge */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-primary tracking-wide">
            {brandName}
          </span>
          {product.isBestSeller && (
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full">
              🔥 پرفروش
            </span>
          )}
        </div>

        {/* Name */}
        <Link
          href={`/product/${product.slug}`}
          className="font-bold text-foreground text-sm leading-snug mb-2 line-clamp-2 hover:text-primary transition-colors"
        >
          {productName}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.floor(rating) ? "#D4A017" : "none"}
                className={
                  i < Math.floor(rating) ? "text-primary" : "text-border"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            ({reviewsCount})
          </span>
        </div>

        {/* Price + Button together */}
        <div className="mt-auto pt-3 border-t border-border/50">
          {isOutOfStock ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {product.oldPrice && (
                  <span className="text-xs text-muted-foreground line-through decoration-rose-400">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    تومان
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded-full">
                ناموجود
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
                  bg-gradient-to-r from-primary to-primary/80
                  hover:from-primary/90 hover:to-primary/70
                  text-primary-foreground font-bold text-sm
                  transition-all duration-300
                  hover:shadow-gold hover:-translate-y-0.5
                  active:translate-y-0
                  ${isAdding ? "opacity-70 cursor-wait" : ""}
                `}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال افزودن...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    افزودن به سبد
                  </>
                )}
              </button>

              <div className="flex flex-col items-end min-w-[85px]">
                {product.oldPrice && (
                  <span className="text-[10px] text-muted-foreground line-through decoration-rose-400">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-base font-extrabold gold-text">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground">
                    تومان
                  </span>
                </div>
                {isLowStock && (
                  <span className="text-[9px] font-bold text-orange-500 mt-0.5">
                    فقط {stock} عدد
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
