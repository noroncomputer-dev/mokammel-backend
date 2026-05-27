"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Package,
  Truck,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  Sparkles,
} from "lucide-react";
import api from "@/services/api/axios";

const formatPrice = (price: number) => {
  if (isNaN(price) || price === undefined || price === null) {
    return "۰ تومان";
  }
  return price.toLocaleString("fa-IR") + " تومان";
};

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    slug: string;
  };
  name: string;
  image: string;
  price: number;
  quantity: number;
  flavor?: string;
  weight?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: string;
  zarinpalRefId?: string;
  trackingCode?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: any; color: string; step: number }
> = {
  pending: {
    label: "در انتظار پرداخت",
    icon: Clock,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    step: 1,
  },
  processing: {
    label: "در حال پردازش",
    icon: Package,
    color: "bg-primary/10 text-primary border border-primary/20",
    step: 2,
  },
  shipped: {
    label: "ارسال شده",
    icon: Truck,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    step: 3,
  },
  delivered: {
    label: "تحویل شده",
    icon: CheckCircle,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
    step: 4,
  },
  cancelled: {
    label: "لغو شده",
    icon: XCircle,
    color:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800",
    step: 0,
  },
};

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      console.log("Order data:", response.data);

      if (response.data.success) {
        setOrder(response.data.data.order);
      } else {
        setError("سفارش یافت نشد");
      }
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات سفارش");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const getStatusDate = () => {
    if (!order) return "";
    if (order.deliveredAt)
      return new Date(order.deliveredAt).toLocaleDateString("fa-IR");
    if (order.paidAt) return new Date(order.paidAt).toLocaleDateString("fa-IR");
    return new Date(order.createdAt).toLocaleDateString("fa-IR");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96" dir="rtl">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground mt-4">
          در حال بارگذاری اطلاعات سفارش...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16" dir="rtl">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 mb-6">
          <XCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          خطا در دریافت اطلاعات
        </h1>
        <p className="text-muted-foreground mb-8">
          {error || "سفارش یافت نشد"}
        </p>
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 px-6 py-3 btn-gold rounded-xl font-bold shadow-md"
        >
          <ArrowLeft size={18} />
          بازگشت به سفارشات من
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
      {/* ==================== هدر ==================== */}
      <div className="mb-8">
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          بازگشت به سفارشات من
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            پیگیری سفارش
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">شماره سفارش:</span>
            <span className="font-mono font-bold text-foreground">
              {order.orderNumber}
            </span>
          </div>
        </div>
      </div>

      {/* ==================== وضعیت سفارش ==================== */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${statusInfo.color}`}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">وضعیت فعلی</p>
            <p className="text-xl font-bold text-foreground">
              {statusInfo.label}
            </p>
          </div>
        </div>

        {/* نوار پیشرفت وضعیت */}
        {order.status !== "cancelled" && (
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              {["pending", "processing", "shipped", "delivered"].map(
                (step, idx) => {
                  const stepInfo = statusConfig[step];
                  const isActive = statusInfo.step >= stepInfo.step;
                  return (
                    <div
                      key={step}
                      className="flex flex-col items-center text-center flex-1"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isActive ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        {stepInfo.label}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
            <div className="relative h-2 bg-muted rounded-full mt-2">
              <div
                className="absolute h-full bg-gradient-to-r from-primary/70 to-primary rounded-full transition-all duration-500"
                style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ==================== اطلاعات محصولات ==================== */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold gold-text mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            محصولات سفارش
          </h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 pb-3 border-b border-border last:border-0"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/50 flex-shrink-0 border border-border">
                  <img
                    src={
                      item.image ||
                      item.product?.images?.[0] ||
                      "/placeholder-image.jpg"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  {(item.flavor || item.weight) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.flavor && <span>طعم: {item.flavor}</span>}
                      {item.flavor && item.weight && (
                        <span className="mx-1">|</span>
                      )}
                      {item.weight && <span>وزن: {item.weight}</span>}
                    </p>
                  )}
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      تعداد: {item.quantity}
                    </span>
                    <span className="text-sm font-bold gold-text">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== اطلاعات ارسال و پرداخت ==================== */}
        <div className="space-y-6">
          {/* اطلاعات ارسال */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold gold-text mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              آدرس تحویل
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>{order.shippingAddress.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="text-muted-foreground mt-2">
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}، {order.shippingAddress.province}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  کد پستی: {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* اطلاعات پرداخت */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold gold-text mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              اطلاعات پرداخت
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">جمع کل:</span>
                <span className="text-foreground">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>تخفیف:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-foreground">مبلغ پرداختی:</span>
                <span className="gold-text">
                  {formatPrice(order.finalPrice)}
                </span>
              </div>
              {order.zarinpalRefId && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>کد پیگیری:</span>
                    <span className="font-mono text-primary">
                      {order.zarinpalRefId}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>تاریخ ثبت سفارش:</span>
                <span>
                  {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>تاریخ پرداخت:</span>
                  <span>
                    {new Date(order.paidAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* کد رهگیری */}
          {order.trackingCode && (
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <p className="text-sm text-primary">
                کد رهگیری مرسوله:{" "}
                <span className="font-bold">{order.trackingCode}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== دکمه‌های اقدام ==================== */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        {order.paymentStatus === "unpaid" && (
          <Link
            href={`/payment/${order._id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-gold rounded-xl font-bold shadow-md"
          >
            <CreditCard size={18} />
            پرداخت سفارش
          </Link>
        )}

        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 btn-gold-outline rounded-xl font-bold"
        >
          خرید مجدد
        </Link>
      </div>
    </div>
  );
}
