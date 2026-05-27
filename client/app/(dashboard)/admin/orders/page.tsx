"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import api from "../../../services/api/axios";

type StatusType =
  | "all"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const limit = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const res = await api.get("/orders", {
        params: { page, limit, status },
      });

      let ordersList = [];
      let pagination = { pages: 1 };

      if (res.data?.data?.orders) {
        ordersList = res.data.data.orders;
        pagination = res.data.data.pagination || { pages: 1 };
      } else if (res.data?.orders) {
        ordersList = res.data.orders;
        pagination = res.data.pagination || { pages: 1 };
      } else if (Array.isArray(res.data)) {
        ordersList = res.data;
      }

      setOrders(ordersList);
      setTotalPages(pagination.pages || 1);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.shippingAddress?.phone?.includes(search)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3.5 w-3.5" />;
      case "processing":
        return <RefreshCw className="h-3.5 w-3.5" />;
      case "shipped":
        return <Truck className="h-3.5 w-3.5" />;
      case "delivered":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "cancelled":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <Package className="h-3.5 w-3.5" />;
    }
  };

  const getNextStatuses = (
    currentStatus: string,
  ): { value: string; label: string }[] => {
    const statusFlow: Record<string, string[]> = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    const nextStatuses = statusFlow[currentStatus] || [];
    return nextStatuses.map((s) => ({ value: s, label: statusLabels[s] }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 dark:text-primary/70 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت سفارشات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مشاهده و مدیریت وضعیت سفارشات مشتریان
          </p>
        </div>
        <div className="badge-gold text-sm">
          <Package className="h-3.5 w-3.5 inline ml-1" />
          مجموع: {orders.length} سفارش
        </div>
      </div>

      {/* ==================== فیلترهای طلایی ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* جستجو */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی سفارش (شماره، نام، تلفن)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-luxury w-full pr-10 pl-4 py-2.5 text-sm"
            />
          </div>

          {/* فیلتر وضعیت طلایی */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusType);
              setPage(1);
            }}
            className="input-luxury px-4 py-2.5 text-sm cursor-pointer"
          >
            <option value="all">همه سفارشات</option>
            <option value="pending">در انتظار پرداخت</option>
            <option value="processing">در حال پردازش</option>
            <option value="shipped">ارسال شده</option>
            <option value="delivered">تحویل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>
      </div>

      {/* ==================== جدول سفارشات لوکس ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">سفارشی یافت نشد</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    شماره سفارش
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    مشتری
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تلفن
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    مبلغ کل
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    وضعیت سفارش
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    وضعیت پرداخت
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تاریخ
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredOrders.map((order, index) => {
                  const userName = order.user?.name || "مهمان";
                  const userPhone = order.shippingAddress?.phone || "-";

                  return (
                    <tr
                      key={order._id}
                      className="group hover:bg-muted/30 transition-all duration-200"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono font-medium text-foreground">
                          #{order.orderNumber || order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-foreground">
                          {userName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {userPhone}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold gold-text">
                          {formatPrice(order.finalPrice)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[order.status]}`}
                          >
                            {getStatusIcon(order.status)}
                            {statusLabels[order.status]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${paymentStatusColors[order.paymentStatus]}`}
                        >
                          {paymentStatusLabels[order.paymentStatus]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString(
                            "fa-IR",
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getNextStatuses(order.status).length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusChange(order._id, e.target.value);
                                }
                              }}
                              disabled={updatingId === order._id}
                              className="text-xs px-2 py-1.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer hover:border-primary"
                            >
                              <option value="">تغییر وضعیت</option>
                              {getNextStatuses(order.status).map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          )}

                          <Link href={`/admin/orders/${order._id}`}>
                            <button
                              className="p-2 rounded-lg hover:bg-muted/80 transition-all duration-200 group/btn"
                              title="مشاهده جزئیات"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ==================== صفحه‌بندی طلایی ==================== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              صفحه <span className="text-primary font-medium">{page}</span> از{" "}
              {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
