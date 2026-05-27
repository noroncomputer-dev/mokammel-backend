"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import orderService, { Order } from "@/services/api/orders";

const statusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const statusColors: Record<string, string> = {
  pending:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  processing: "bg-primary/10 text-primary border-primary/20",
  shipped:
    "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  delivered:
    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  cancelled:
    "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

const paymentStatusLabels: Record<string, string> = {
  unpaid: "پرداخت نشده",
  paid: "پرداخت شده",
  refunded: "عودت داده شده",
};

const paymentStatusColors: Record<string, string> = {
  unpaid:
    "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  paid: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  refunded:
    "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error("Error fetching order:", err);
      setError(err.response?.data?.message || "خطا در دریافت اطلاعات سفارش");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order) return;
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(order._id, newStatus);
      await fetchOrder();
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "خطا در بروزرسانی وضعیت");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <RefreshCw className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getNextStatuses = (
    currentStatus: string,
  ): { value: Order["status"]; label: string }[] => {
    const statusFlow: Record<string, Order["status"][]> = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    const nextStatuses = statusFlow[currentStatus] || [];
    return nextStatuses.map((s) => ({ value: s, label: statusLabels[s] }));
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 gap-3"
        dir="rtl"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
        <span className="text-muted-foreground">در حال بارگذاری سفارش...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12" dir="rtl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-4">
          <XCircle className="h-8 w-8 text-rose-500" />
        </div>
        <div className="text-rose-500 mb-4">{error || "سفارش یافت نشد"}</div>
        <button
          onClick={() => router.back()}
          className="btn-gold inline-flex items-center gap-2 px-5 py-2.5"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </button>
      </div>
    );
  }

  const userName =
    typeof order.user === "object"
      ? (order.user as any)?.name || "کاربر مهمان"
      : "کاربر مهمان";

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-primary/10 transition-all duration-200 group"
          >
            <ArrowRight className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary/80 dark:text-primary/70 uppercase tracking-wider">
                جزییات سفارش
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold gold-text">
              سفارش #{order._id.slice(-8)}
            </h1>
          </div>
        </div>

        {/* ==================== دکمه‌های تغییر وضعیت طلایی ==================== */}
        {getNextStatuses(order.status).length > 0 && (
          <div className="flex gap-2">
            {getNextStatuses(order.status).map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={updating}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md ${
                  status.value === "cancelled"
                    ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
                    : "btn-gold"
                }`}
              >
                {getStatusIcon(status.value)}
                {updating ? "در حال بروزرسانی..." : status.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== اطلاعات اصلی - 2/3 ==================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* وضعیت سفارش */}
          <div className="card-luxury p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
              <Package className="h-5 w-5" />
              وضعیت سفارش
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${statusColors[order.status]}`}
              >
                {getStatusIcon(order.status)}
                {statusLabels[order.status]}
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border ${paymentStatusColors[order.paymentStatus]}`}
              >
                <CreditCard className="h-4 w-4" />
                {paymentStatusLabels[order.paymentStatus]}
              </span>
            </div>
          </div>

          {/* محصولات سفارش */}
          <div className="card-luxury p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
              <ShoppingBag className="h-5 w-5" />
              محصولات
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted/50 border border-border/50 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    {(item.flavor || item.weight) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.flavor && `طعم: ${item.flavor}`}
                        {item.flavor && item.weight && " | "}
                        {item.weight && `وزن: ${item.weight}`}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold gold-text">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* جمع‌بندی قیمت */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">قیمت کل:</span>
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
                  <span className="text-foreground">مبلغ قابل پرداخت:</span>
                  <span className="gold-text text-xl">
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== اطلاعات جانبی - 1/3 ==================== */}
        <div className="space-y-6">
          {/* اطلاعات مشتری */}
          <div className="card-luxury p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
              <User className="h-5 w-5" />
              اطلاعات مشتری
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="text-foreground">{userName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-foreground">
                  {order.shippingAddress?.phone || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-foreground">
                  {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-foreground">
                    تاریخ پرداخت:{" "}
                    {new Date(order.paidAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* آدرس ارسال */}
          <div className="card-luxury p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
              <MapPin className="h-5 w-5" />
              آدرس ارسال
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">
                {order.shippingAddress?.fullName}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress?.phone}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress?.province}، {order.shippingAddress?.city}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress?.address}
              </p>
              <p className="text-muted-foreground">
                کد پستی: {order.shippingAddress?.postalCode}
              </p>
            </div>
          </div>

          {/* اطلاعات پرداخت */}
          <div className="card-luxury p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 gold-text">
              <CreditCard className="h-5 w-5" />
              اطلاعات پرداخت
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">روش پرداخت:</span>
                <span className="badge-gold text-xs">زرین‌پال</span>
              </div>
              {order.zarinpalRefId && (
                <div className="flex flex-col gap-1 pt-2 border-t border-border/50">
                  <span className="text-muted-foreground text-xs">
                    شماره پیگیری:
                  </span>
                  <span className="font-mono text-xs text-primary bg-primary/5 px-2 py-1 rounded-lg text-center">
                    {order.zarinpalRefId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
