"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/services/api/axios";

const formatPrice = (price: number) =>
  price?.toLocaleString("fa-IR") + " تومان" || "0 تومان";

const statusLabels: Record<string, string> = {
  pending: "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const statusColors: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  processing:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  shipped:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function ProfileOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/orders/my?page=${page}&limit=10`);
      if (response.data.success) {
        setOrders(response.data.data.orders);
        setTotalPages(response.data.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16" dir="rtl">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          سفارشی یافت نشد
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          شما هنوز سفارشی ثبت نکرده‌اید.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition"
        >
          شروع خرید
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        سفارشات من
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6"
          >
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  شماره سفارش
                </p>
                <p className="font-mono font-bold text-gray-900 dark:text-white">
                  {order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  تاریخ ثبت
                </p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  مبلغ کل
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatPrice(order.finalPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  وضعیت
                </p>
                <span
                  className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${statusColors[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
              <Link
                href={`/track-order/${order._id}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Eye className="h-4 w-4" />
                مشاهده جزئیات
              </Link>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                محصولات:
              </p>
              <div className="flex flex-wrap gap-2">
                {order.items?.slice(0, 3).map((item: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg"
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {order.items?.length > 3 && (
                  <span className="text-sm text-gray-500">
                    + {order.items.length - 3} محصول دیگر
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="py-2 px-4 text-sm">
            صفحه {page} از {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
