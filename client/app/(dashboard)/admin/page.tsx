"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  DollarSign,
  Clock,
  Bell,
  Eye,
  AlertCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import api from "@/services/api/axios";
import Link from "next/link";

interface DashboardStats {
  totalSalesToday: number;
  totalSalesYesterday: number;
  totalSalesMonth: number;
  totalSalesYear: number;
  salesChangePercent: number;
  newOrdersToday: number;
  newOrdersYesterday: number;
  newOrdersWeek: number;
  totalOrders: number;
  ordersChangePercent: number;
  totalUsers: number;
  newUsersToday: number;
  newUsersYesterday: number;
  newUsersWeek: number;
  usersChangePercent: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  conversionRate: number;
  monthlyTarget: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  user: { name: string };
  finalPrice: number;
  status: string;
  createdAt: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ==================== کارت آمار طلایی ====================
const StatCard = ({ title, value, change, trend, icon: Icon }: any) => (
  <div className="card-luxury p-6 hover:shadow-gold transition-all duration-300 min-w-[200px] group">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-black text-foreground mt-2 break-words">
          {value}
        </p>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 mt-3 text-xs ${
              trend === "up" ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span className="whitespace-nowrap">
              {Math.abs(change)}% نسبت به دیروز
            </span>
          </div>
        )}
      </div>
      <div
        className={`p-3 rounded-xl bg-primary/10 shrink-0 group-hover:bg-primary/20 transition-all duration-300`}
      >
        <Icon className={`h-6 w-6 text-primary`} />
      </div>
    </div>
  </div>
);

// ==================== وضعیت‌های سفارش با تم طلایی ====================
const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending: {
    label: "در انتظار",
    cls: "badge-gold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  processing: {
    label: "در حال پردازش",
    cls: "badge-gold bg-primary/10 text-primary border-primary/20",
  },
  shipped: {
    label: "ارسال شده",
    cls: "badge-gold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  delivered: {
    label: "تحویل شده",
    cls: "badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  cancelled: {
    label: "لغو شده",
    cls: "badge-gold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, notifRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/orders", { params: { page: 1, limit: 5 } }),
        api.get("/notifications/admin/latest"),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (ordersRes.data.success)
        setRecentOrders(ordersRes.data.data?.orders || []);
      if (notifRes.data.success)
        setNotifications(notifRes.data.data?.notifications || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ==================== لودینگ طلایی ====================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "فروش امروز",
      value: formatPrice(stats?.totalSalesToday || 0),
      change: stats?.salesChangePercent,
      trend: (stats?.salesChangePercent || 0) >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "سفارش جدید امروز",
      value: stats?.newOrdersToday || 0,
      change: stats?.ordersChangePercent,
      trend: (stats?.ordersChangePercent || 0) >= 0 ? "up" : "down",
      icon: ShoppingBag,
    },
    {
      title: "فروش ماه",
      value: formatPrice(stats?.totalSalesMonth || 0),
      icon: TrendingUp,
    },
    {
      title: "کاربران جدید امروز",
      value: stats?.newUsersToday || 0,
      change: stats?.usersChangePercent,
      trend: (stats?.usersChangePercent || 0) >= 0 ? "up" : "down",
      icon: Users,
    },
    {
      title: "کل محصولات",
      value: stats?.totalProducts || 0,
      icon: Package,
    },
    {
      title: "موجودی کم",
      value: stats?.lowStockProducts || 0,
      icon: AlertCircle,
    },
  ];

  const lowStock = stats?.lowStockProducts ?? 0;
  const pendingOrd = stats?.pendingOrders ?? 0;

  return (
    <div className="space-y-8" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 dark:text-primary/70 uppercase tracking-wider">
              خلاصه عملکرد
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            داشبورد مدیریت
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            گزارش لحظه‌ای فروش و سفارشات
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl border border-border whitespace-nowrap">
          <Calendar className="h-4 w-4 text-primary" />
          {new Date().toLocaleDateString("fa-IR")}
        </div>
      </div>

      {/* ==================== کارت‌های آمار ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* ==================== هشدارها ==================== */}
      {(lowStock > 0 || pendingOrd > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {lowStock > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-semibold">هشدار موجودی:</span>
                <span>{lowStock} محصول در آستانه اتمام موجودی</span>
              </div>
              <Link
                href="/admin/products"
                className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 mt-3 inline-block font-medium transition-colors"
              >
                مشاهده و مدیریت →
              </Link>
            </div>
          )}
          {pendingOrd > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Clock className="h-5 w-5 shrink-0" />
                <span className="font-semibold">سفارشات در انتظار:</span>
                <span>{pendingOrd} سفارش نیاز به بررسی دارند</span>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 mt-3 inline-block font-medium transition-colors"
              >
                مشاهده و مدیریت →
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ==================== سفارشات اخیر ==================== */}
        <div className="lg:col-span-2 card-luxury overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center flex-wrap gap-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              سفارشات اخیر
            </h3>
            <Link
              href="/admin/orders"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              مشاهده همه
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-muted/30">
                <tr>
                  {["شماره سفارش", "مشتری", "مبلغ", "وضعیت", ""].map((h) => (
                    <th
                      key={h}
                      className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      سفارشی ثبت نشده است
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, index) => {
                    const st = ORDER_STATUS[order.status] || {
                      label: order.status,
                      cls: "badge-gold bg-gray-100 text-gray-600",
                    };
                    return (
                      <tr
                        key={order._id}
                        className="group hover:bg-muted/30 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-3 px-4 font-mono text-sm font-medium text-foreground break-words">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground break-words">
                          {order.user?.name || "مهمان"}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold gold-text whitespace-nowrap">
                          {formatPrice(order.finalPrice)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10 inline-flex"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== اعلانات ==================== */}
        <div className="card-luxury overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center flex-wrap gap-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              اعلانات
            </h3>
            <span className="badge-gold text-xs">
              {notifications.filter((n) => !n.isRead).length} جدید
            </span>
          </div>
          <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                هیچ اعلانی وجود ندارد
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    !notif.isRead
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/30"
                  }`}
                  onClick={() => markNotificationAsRead(notif._id)}
                >
                  <div className="flex items-start gap-3">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 animate-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground break-words">
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {new Date(notif.createdAt).toLocaleString("fa-IR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================== نرخ تبدیل و هدف ماهانه ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="card-luxury p-6">
          <h3 className="font-bold text-foreground mb-4 text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            نرخ تبدیل سفارش
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-4xl font-black gold-text">
              {stats?.conversionRate || 0}%
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[100px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                style={{
                  width: `${Math.min(stats?.conversionRate || 0, 100)}%`,
                }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            نسبت سفارشات تکمیل شده به کل سفارشات
          </p>
        </div>

        <div className="card-luxury p-6">
          <h3 className="font-bold text-foreground mb-4 text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            پیشرفت هدف ماهانه
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-4xl font-black gold-text">
              {Math.min(stats?.monthlyTarget || 0, 100)}%
            </div>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[100px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                style={{
                  width: `${Math.min(stats?.monthlyTarget || 0, 100)}%`,
                }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            هدف فروش ماهانه: {formatPrice(500000000)} تومان
          </p>
        </div>
      </div>
    </div>
  );
}
