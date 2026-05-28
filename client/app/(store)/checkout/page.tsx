"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import paymentService from "@/services/api/payment";
import { useAuthStore } from "@/store/auth.store";
import api from "@/services/api/axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Truck,
  User,
  CreditCard,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const formatPrice = (price: number) => price.toLocaleString("fa-IR") + " تومان";

const provinces = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
];

const shippingMethods = [
  { id: "post", name: "پست پیشتاز", price: 50000, time: "۲ تا ۴ روز کاری" },
  { id: "express", name: "پیک موتوری (تهران)", price: 80000, time: "۲۴ ساعت" },
  { id: "pickup", name: "تحویل حضوری", price: 0, time: "روز بعد" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { items, getSubtotal, getDiscount, getTotal, getTotalItems } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ 1️⃣ اول احراز هویت رو چک کن
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
    setMounted(true);
  }, [checkAuth]);

  // ✅ 2️⃣ بعد از چک شدن احراز هویت، تصمیم بگیر
  useEffect(() => {
    if (authChecked && !isLoading) {
      if (!isAuthenticated) {
        router.replace("/login?redirect=/checkout");
      }
    }
  }, [authChecked, isAuthenticated, isLoading, router]);

  // ✅ 3️⃣ پر کردن اطلاعات کاربر در فرم
  useEffect(() => {
    if (mounted && isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "",
      }));
    }
  }, [user, mounted, isAuthenticated]);

  // ✅ 4️⃣ چک کردن سبد خرید خالی
  useEffect(() => {
    if (
      mounted &&
      authChecked &&
      !isLoading &&
      isAuthenticated &&
      getTotalItems() === 0 &&
      !submitting
    ) {
      router.push("/cart");
      toast.error("سبد خرید شما خالی است");
    }
  }, [
    mounted,
    authChecked,
    isLoading,
    isAuthenticated,
    getTotalItems,
    router,
    submitting,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "نام و نام خانوادگی الزامی است";
    if (!formData.phone.trim()) newErrors.phone = "شماره تلفن الزامی است";
    if (!formData.province) newErrors.province = "استان الزامی است";
    if (!formData.city.trim()) newErrors.city = "شهر الزامی است";
    if (!formData.address.trim()) newErrors.address = "آدرس الزامی است";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "کد پستی الزامی است";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (getTotalItems() === 0) {
      toast.error("سبد خرید شما خالی است");
      router.push("/cart");
      return;
    }

    if (!validateForm()) {
      toast.error("لطفاً اطلاعات فرم را کامل کنید");
      return;
    }

    setSubmitting(true);

    try {
      const currentItems = [...items];
      const currentSubtotal = getSubtotal();
      const currentDiscount = getDiscount();
      const currentTotal = getTotal();
      const finalTotal =
        currentTotal + selectedShipping.price - currentDiscount;

      const orderData = {
        items: currentItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          image: item.image,
          flavor: item.flavor,
          weight: item.weight,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          province: formData.province,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode,
        },
        totalPrice: currentSubtotal,
        discountAmount: currentDiscount,
        finalPrice: finalTotal,
        paymentMethod: "zarinpal",
      };

      const response = await api.post("/orders", orderData);

      if (response.data.success) {
        const orderId = response.data.data.order._id;
        const finalAmount = response.data.data.order.finalPrice;

        const payment = await paymentService.requestPayment(
          orderId,
          finalAmount,
          `پرداخت سفارش شماره ${response.data.data.order.orderNumber || orderId.slice(-8)}`,
        );

        window.location.href = payment.paymentUrl;
      } else {
        toast.error(response.data.message || "خطا در ثبت سفارش");
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message ||
          "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید",
      );
      setSubmitting(false);
    }
  };

  const subtotal = mounted ? getSubtotal() : 0;
  const discount = mounted ? getDiscount() : 0;
  const total = mounted ? getTotal() : 0;
  const totalItems = mounted ? getTotalItems() : 0;
  const finalTotal = total + selectedShipping.price - discount;

  // ==================== نمایش لودینگ ====================
  if (!mounted || isLoading || !authChecked) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted/50 rounded mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="h-6 bg-muted/50 rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted/50 rounded w-full mb-2" />
                <div className="h-4 bg-muted/50 rounded w-full mb-2" />
                <div className="h-8 bg-muted/50 rounded w-full mt-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // اگر لاگین نباشه، چیزی نشون نده
  if (!isAuthenticated) {
    return null;
  }

  if (totalItems === 0 && !submitting) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center" dir="rtl">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/50 rounded-full mb-6">
          <CreditCard size={40} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          سبد خرید خالی است
        </h1>
        <p className="text-muted-foreground mb-8">
          برای ثبت سفارش، ابتدا محصولی به سبد خرید اضافه کنید.
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* بردکرامب */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        <ChevronLeft size={14} />
        <Link href="/cart" className="hover:text-primary transition-colors">
          سبد خرید
        </Link>
        <ChevronLeft size={14} />
        <span className="text-foreground font-medium">تکمیل خرید</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* فرم اطلاعات */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User size={20} className="text-primary" />
                اطلاعات ارسال
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    نام و نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.fullName ? "border-rose-500" : "border-border"} text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    placeholder="علی رضایی"
                  />
                  {errors.fullName && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    شماره تلفن <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.phone ? "border-rose-500" : "border-border"} text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    placeholder="09123456789"
                  />
                  {errors.phone && (
                    <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    استان <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.province ? "border-rose-500" : "border-border"} text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                  >
                    <option value="">انتخاب استان</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    شهر <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.city ? "border-rose-500" : "border-border"} text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    placeholder="تهران"
                  />
                  {errors.city && (
                    <p className="text-rose-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    آدرس <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.address ? "border-rose-500" : "border-border"} text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    placeholder="خیابان اصلی، پلاک ۱۲۳، واحد ۵"
                  />
                  {errors.address && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    کد پستی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border ${errors.postalCode ? "border-rose-500" : "border-border"} text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    placeholder="۱۲۳۴۵۶۷۸۹۰"
                  />
                  {errors.postalCode && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* روش ارسال */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Truck size={20} className="text-primary" />
                روش ارسال
              </h2>
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedShipping.id === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShipping.id === method.id}
                        onChange={() => setSelectedShipping(method)}
                        className="w-4 h-4 text-primary focus:ring-primary/30"
                      />
                      <div>
                        <p className="font-medium text-foreground">
                          {method.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          زمان تحویل: {method.time}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold gold-text">
                      {method.price === 0
                        ? "رایگان"
                        : formatPrice(method.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 btn-gold rounded-xl font-bold flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-strong disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  در حال ثبت سفارش...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  ثبت سفارش و پرداخت
                </>
              )}
            </button>
          </form>
        </div>

        {/* خلاصه سفارش */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
            <h3 className="text-lg font-bold gold-text mb-4 pb-3 border-b border-border">
              خلاصه سفارش
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <img
                    src={item.image || "/placeholder-image.jpg"}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تعداد: {item.quantity}
                    </p>
                    {item.flavor && (
                      <p className="text-xs text-muted-foreground">
                        طعم: {item.flavor}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(
                      (item.discountPrice || item.price) * item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>جمع کل محصولات</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>تخفیف</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>هزینه ارسال</span>
                <span>
                  {selectedShipping.price === 0
                    ? "رایگان"
                    : formatPrice(selectedShipping.price)}
                </span>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg text-foreground">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="gold-text">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/cart"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              بازگشت به سبد خرید
            </Link>

            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                پرداخت امن توسط زرین‌پال
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
