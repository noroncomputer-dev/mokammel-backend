"use client";
import { useCartStore } from "@/store/cart.store";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Coffee,
  Zap,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Minus,
  Plus,
  AlertCircle,
  Package,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import productService, { Product } from "@/services/api/products";
import ProductReviews from "@/components/product/ProductReviews";
import { toast } from "sonner";

// ==================== تایپ‌ها ====================
interface SelectedImage {
  url: string;
  index: number;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  brand: { name: string };
}

// ==================== کامپوننت نمایش امتیاز ====================
const RatingStars = ({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars
                ? "text-yellow-400 fill-yellow-400"
                : i === fullStars && hasHalfStar
                  ? "text-yellow-400 fill-yellow-400/50"
                  : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
      {reviewCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} نظر)
        </span>
      )}
    </div>
  );
};

// ==================== کامپوننت شمارنده ====================
const QuantitySelector = ({ quantity, onIncrease, onDecrease }: any) => (
  <div className="flex items-center border border-border rounded-xl overflow-hidden">
    <button
      onClick={onDecrease}
      className="px-3 py-2 hover:bg-primary/10 transition disabled:opacity-50 text-foreground"
      disabled={quantity <= 1}
    >
      <Minus className="h-4 w-4" />
    </button>
    <span className="w-12 text-center font-medium text-foreground">
      {quantity}
    </span>
    <button
      onClick={onIncrease}
      className="px-3 py-2 hover:bg-primary/10 transition text-foreground"
    >
      <Plus className="h-4 w-4" />
    </button>
  </div>
);

// ==================== کامپوننت اصلی ====================
export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "specs" | "ingredients" | "howToUse"
  >("specs");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [addingToCart, setAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ==================== دریافت محصول ====================
  const fetchProduct = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductBySlug(slug);

      const productData = response?.product || response;
      const related = response?.relatedProducts || [];

      if (!productData) {
        setError("محصول یافت نشد");
        setLoading(false);
        return;
      }

      const safeProduct = {
        ...productData,
        specifications: productData.specifications || {
          weight: "",
          servingSize: "",
          servingsPerContainer: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugar: 0,
          sodium: 0,
          caffeine: 0,
          creatine: 0,
          betaAlanine: 0,
          bcaa: 0,
          glutamine: 0,
        },
        ingredients: productData.ingredients || [],
        howToUse: productData.howToUse || "",
        warnings: productData.warnings || "",
        flavors: productData.flavors || [],
      };

      setProduct(safeProduct);
      setRelatedProducts(related);

      if (safeProduct.flavors?.length) {
        const firstFlavor =
          typeof safeProduct.flavors[0] === "string"
            ? safeProduct.flavors[0]
            : safeProduct.flavors[0]?.name;
        setSelectedFlavor(firstFlavor || "");
      }

      if (safeProduct.images?.length) {
        setSelectedImage({ url: safeProduct.images[0], index: 0 });
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات محصول");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // ==================== هندلرها ====================
  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      const cartItem = {
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity,
        flavor: selectedFlavor,
        image: product.images?.[0],
        slug: product.slug,
      };

      // 1️⃣ دریافت سبد خرید فعلی
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = existingCart.findIndex(
        (item: any) =>
          item.productId === product._id && item.flavor === selectedFlavor,
      );

      // 2️⃣ به‌روزرسانی سبد خرید
      if (existingIndex >= 0) {
        existingCart[existingIndex].quantity += quantity;
      } else {
        existingCart.push(cartItem);
      }

      // 3️⃣ ذخیره در localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));

      // 4️⃣ ✅ مهم: به‌روزرسانی state در store (برای آپدیت خودکار هدر)
      // استفاده از useCartStore برای آپدیت خودکار تعداد سبد خرید
      const { addItem } = useCartStore.getState();
      addItem(cartItem);

      // 5️⃣ نمایش پیام موفقیت با toast (به جای alert)
      toast.success(`${product.name} به سبد خرید اضافه شد`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("خطا در افزودن به سبد خرید");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    setIsWishlisted(!isWishlisted);
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    if (!isWishlisted) {
      if (!wishlist.includes(product._id)) {
        wishlist.push(product._id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      }
    } else {
      const newWishlist = wishlist.filter((id: string) => id !== product._id);
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    }
  };

  // ==================== لودینگ ====================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96" dir="rtl">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground mt-4">در حال بارگذاری محصول...</p>
      </div>
    );
  }

  // ==================== خطا ====================
  if (error || !product) {
    return (
      <div className="text-center py-12" dir="rtl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-4">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          محصول یافت نشد
        </h2>
        <p className="text-muted-foreground mb-6">
          {error || "متاسفانه محصول مورد نظر موجود نیست."}
        </p>
        <button
          onClick={() => (window.location.href = "/products")}
          className="px-6 py-2 btn-gold"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  // ==================== محاسبات قیمت ====================
  const inStock = (product.stock || 0) > 0;
  const lowStock = (product.stock || 0) > 0 && (product.stock || 0) < 5;
  const hasDiscount = (product.discountPrice || 0) > 0;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100,
      )
    : 0;
  const finalPrice = hasDiscount ? product.discountPrice! : product.price;
  const specs = product.specifications || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* ==================== بخش اصلی محصول ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* گالری تصاویر - با عرض محدود و فیت */}
        <div className="space-y-4">
          {/* تصویر اصلی با سایز محدود */}
          <div className="relative max-w-2xl mx-auto aspect-square rounded-2xl overflow-hidden bg-muted/30 border border-border">
            {hasDiscount && (
              <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-lg text-sm font-bold shadow-glow">
                {discountPercent}٪ تخفیف
              </div>
            )}
            {lowStock && (
              <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                موجودی محدود
              </div>
            )}
            <img
              src={
                selectedImage?.url || product.images?.[0] || "/placeholder.png"
              }
              alt={product.name}
              className="w-full h-full object-contain bg-muted/20"
            />
          </div>

          {/* تصاویر کوچک - با عرض ثابت و اسکرول افقی */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage({ url: img, index: idx })}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0 transition-all ${
                    selectedImage?.index === idx
                      ? "ring-2 ring-primary ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - تصویر ${idx + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* اطلاعات محصول */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {product.brand?.name || "بدون برند"}
            </span>
            <span className="text-border">|</span>
            <span className="text-sm text-muted-foreground">
              {product.category?.name || "بدون دسته"}
            </span>
          </div>
          {product.rating > 0 && (
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {product.shortDescription || product.description?.substring(0, 200)}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold gold-text">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
                  {discountPercent}٪ تخفیف
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  موجود در انبار
                  {lowStock && (
                    <span className="text-amber-500 mr-1">
                      (تنها {product.stock} عدد باقی مانده)
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span className="text-sm text-rose-500 dark:text-rose-400">
                  ناموجود
                </span>
              </>
            )}
          </div>

          {/* طعم‌ها */}
          {product.flavors && product.flavors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                طعم:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor, idx) => {
                  const flavorName =
                    typeof flavor === "string" ? flavor : flavor?.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedFlavor(flavorName)}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        selectedFlavor === flavorName
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {flavorName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* تعداد و دکمه‌ها */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            />
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="flex-1 btn-gold py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              {addingToCart ? "در حال افزودن..." : "افزودن به سبد خرید"}
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-3 border rounded-xl transition-all ${
                isWishlisted
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? "fill-rose-500" : ""}`}
              />
            </button>
          </div>

          {/* مزایا */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" /> ارسال سریع
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> ضمانت اصالت
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw className="h-4 w-4 text-primary" /> ۷ روز گارانتی
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" /> پرداخت امن
            </div>
          </div>
        </div>
      </div>

      {/* ==================== تب‌های مشخصات ==================== */}
      <div className="mt-12">
        <div className="flex flex-wrap gap-2 border-b border-border">
          {[
            { id: "specs", label: "مشخصات فنی" },
            { id: "ingredients", label: "ترکیبات" },
            { id: "howToUse", label: "نحوه مصرف" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium transition-all duration-200 relative ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {/* مشخصات فنی */}
          {activeTab === "specs" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">وزن محصول:</span>
                  <span className="font-medium text-foreground">
                    {specs.weight || "ثبت نشده"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">حجم هر سروینگ:</span>
                  <span className="font-medium text-foreground">
                    {specs.servingSize || "ثبت نشده"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">تعداد سروینگ:</span>
                  <span className="font-medium text-foreground">
                    {specs.servingsPerContainer || "ثبت نشده"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">کالری:</span>
                  <span className="font-medium text-foreground">
                    {specs.calories || 0} کالری
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">پروتئین:</span>
                  <span className="font-medium text-foreground">
                    {specs.protein || 0} گرم
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">کربوهیدرات:</span>
                  <span className="font-medium text-foreground">
                    {specs.carbs || 0} گرم
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">چربی:</span>
                  <span className="font-medium text-foreground">
                    {specs.fat || 0} گرم
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">قند:</span>
                  <span className="font-medium text-foreground">
                    {specs.sugar || 0} گرم
                  </span>
                </div>
              </div>

              {(specs.caffeine > 0 ||
                specs.creatine > 0 ||
                specs.betaAlanine > 0 ||
                specs.bcaa > 0 ||
                specs.glutamine > 0) && (
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> مواد فعال هر سروینگ:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specs.caffeine > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Coffee className="h-4 w-4 text-primary" /> کافئین:{" "}
                        {specs.caffeine}mg
                      </div>
                    )}
                    {specs.creatine > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-primary" /> کراتین:{" "}
                        {specs.creatine}g
                      </div>
                    )}
                    {specs.betaAlanine > 0 && (
                      <div className="text-sm text-muted-foreground">
                        بتا آلانین: {specs.betaAlanine}g
                      </div>
                    )}
                    {specs.bcaa > 0 && (
                      <div className="text-sm text-muted-foreground">
                        BCAA: {specs.bcaa}g
                      </div>
                    )}
                    {specs.glutamine > 0 && (
                      <div className="text-sm text-muted-foreground">
                        گلوتامین: {specs.glutamine}g
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ترکیبات */}
          {activeTab === "ingredients" && (
            <div className="bg-card rounded-xl border border-border p-6">
              <ul className="list-disc list-inside space-y-2">
                {product.ingredients && product.ingredients.length > 0 ? (
                  product.ingredients.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {item}
                    </li>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    اطلاعات ترکیبات برای این محصول ثبت نشده است.
                  </p>
                )}
              </ul>
            </div>
          )}

          {/* نحوه مصرف */}
          {activeTab === "howToUse" && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {product.howToUse ||
                    "اطلاعات نحوه مصرف برای این محصول ثبت نشده است."}
                </p>
              </div>
              {product.warnings && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> هشدارها:
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    {product.warnings}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== نظرات کاربران ==================== */}
      <ProductReviews productId={product._id} productName={product.name} />
      {/* ==================== محصولات مرتبط ==================== */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> محصولات مرتبط
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => (
              <a
                key={related._id}
                href={`/product/${related.slug}`}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-premium transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-muted/50">
                  <img
                    src={related.images?.[0] || "/placeholder.png"}
                    alt={related.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {related.brand?.name}
                  </p>
                  <h3 className="text-sm font-medium text-foreground line-clamp-2">
                    {related.name}
                  </h3>
                  <p className="text-base font-bold gold-text mt-2">
                    {formatPrice(related.discountPrice || related.price)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
