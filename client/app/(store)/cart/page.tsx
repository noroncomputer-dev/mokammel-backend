"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { toast } from "sonner";

const formatPrice = (price: number) => price.toLocaleString("fa-IR") + " تومان";

// ─── کامپوننت آیتم سبد خرید ──────────────────────────────
function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: any;
  onUpdateQuantity: (
    id: string,
    quantity: number,
    flavor?: string,
    weight?: string,
  ) => void;
  onRemove: (id: string, flavor?: string, weight?: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleIncrease = () => {
    setLoading(true);
    onUpdateQuantity(
      item.productId,
      item.quantity + 1,
      item.flavor,
      item.weight,
    );
    setTimeout(() => setLoading(false), 200);
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) return;
    setLoading(true);
    onUpdateQuantity(
      item.productId,
      item.quantity - 1,
      item.flavor,
      item.weight,
    );
    setTimeout(() => setLoading(false), 200);
  };

  const handleRemove = () => {
    onRemove(item.productId, item.flavor, item.weight);
    toast.success("محصول از سبد خرید حذف شد");
  };

  const itemTotal = (item.discountPrice || item.price) * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b border-border">
      <Link
        href={`/product/${item.slug || item.productId}`}
        className="sm:w-24 h-24 bg-muted/50 rounded-xl overflow-hidden flex-shrink-0 border border-border"
      >
        <img
          src={item.image || "/placeholder-image.jpg"}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1">
        <div className="flex flex-wrap justify-between gap-2">
          <Link href={`/product/${item.slug || item.productId}`}>
            <h3 className="font-bold text-foreground hover:text-primary transition-colors">
              {item.name}
            </h3>
          </Link>
          <span className="font-black gold-text">{formatPrice(itemTotal)}</span>
        </div>

        {(item.flavor || item.weight) && (
          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
            {item.flavor && <span>طعم: {item.flavor}</span>}
            {item.weight && <span>وزن: {item.weight}</span>}
          </div>
        )}

        <div className="mt-1 text-sm text-muted-foreground">
          قیمت واحد: {formatPrice(item.discountPrice || item.price)}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              disabled={loading || item.quantity <= 1}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-primary/10 disabled:opacity-50 transition-colors"
            >
              <Minus size={14} className="text-foreground" />
            </button>
            <span className="w-8 text-center font-medium text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={loading}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-primary/10 transition-colors"
            >
              <Plus size={14} className="text-foreground" />
            </button>
          </div>
          <button
            onClick={handleRemove}
            className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 text-sm"
          >
            <Trash2 size={16} />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── صفحه اصلی سبد خرید ──────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotal,
    getDiscount,
    getTotalItems,
  } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();
  const totalItems = getTotalItems();

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("لطفاً کد تخفیف را وارد کنید");
      return;
    }
    setCouponLoading(true);
    setTimeout(() => {
      if (couponCode === "SAVE10") {
        const discountAmount = subtotal * 0.1;
        setAppliedCoupon({ code: couponCode, amount: discountAmount });
        toast.success(`کد تخفیف ${couponCode} با موفقیت اعمال شد`);
      } else {
        toast.error("کد تخفیف نامعتبر است");
      }
      setCouponLoading(false);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("کد تخفیف حذف شد");
  };

  // اگر سبد خرید خالی است (بعد از mounted شدن)
  if (mounted && totalItems === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center" dir="rtl">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/50 rounded-full mb-6">
          <ShoppingBag size={40} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          سبد خرید خالی است
        </h1>
        <p className="text-muted-foreground mb-8">
          محصولی به سبد خرید اضافه نکرده‌اید.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 btn-gold rounded-xl font-bold shadow-md"
        >
          <ArrowLeft size={18} />
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  // در حالت لودینگ (قبل از mounted) یک placeholder نمایش بده
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted/50 rounded mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-24 h-24 bg-muted/50 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted/50 rounded w-3/4" />
                      <div className="h-4 bg-muted/50 rounded w-1/2" />
                      <div className="h-4 bg-muted/50 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="h-6 bg-muted/50 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-8 bg-muted/50 rounded w-full mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const finalTotal = total - (appliedCoupon?.amount || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-2xl md:text-3xl font-black gold-text mb-6">
        سبد خرید ({totalItems} محصول)
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ==================== لیست محصولات ==================== */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border border-border p-6">
            {items.map((item, index) => (
              <CartItem
                key={`${item.productId}-${item.flavor}-${item.weight}-${index}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>

        {/* ==================== خلاصه سفارش ==================== */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
            <h3 className="text-lg font-bold gold-text mb-4 pb-3 border-b border-border">
              خلاصه سفارش
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>جمع کل ({totalItems} محصول)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* کد تخفیف */}
              {appliedCoupon ? (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    تخفیف ({appliedCoupon.code})
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-rose-500 hover:text-rose-600 text-xs mr-1 transition-colors"
                    >
                      [حذف]
                    </button>
                  </span>
                  <span>-{formatPrice(appliedCoupon.amount)}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="کد تخفیف"
                    className="flex-1 h-10 px-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="h-10 px-4 bg-muted/50 hover:bg-primary/10 border border-border text-muted-foreground hover:text-primary rounded-xl font-medium text-sm transition-all disabled:opacity-50"
                  >
                    {couponLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Tag size={16} />
                    )}
                  </button>
                </div>
              )}

              <div className="border-t border-border my-3 pt-3">
                <div className="flex justify-between font-bold text-lg text-foreground">
                  <span>قابل پرداخت</span>
                  <span className="gold-text">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full mt-6 py-3 btn-gold rounded-xl font-bold flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-strong transition-all"
            >
              ادامه فرآیند خرید
            </button>

            <Link
              href="/products"
              className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              بازگشت به فروشگاه
            </Link>

            <div className="mt-4 pt-3 border-t border-border text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                پرداخت امن توسط زرین‌پال
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
