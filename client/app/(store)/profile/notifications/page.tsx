"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import notificationService, {
  Notification,
} from "@/services/api/notifications";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getMyNotifications(page, 20);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("همه اعلانات خوانده شد");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("اعلان حذف شد");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return "🛒";
      case "review":
        return "✏️";
      case "payment":
        return "💰";
      case "promotion":
        return "🎉";
      default:
        return "🔔";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "order":
        return "سفارش";
      case "review":
        return "نظر";
      case "payment":
        return "پرداخت";
      case "promotion":
        return "تخفیف";
      default:
        return "سیستم";
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            اعلانات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {unreadCount} اعلان خوانده نشده
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
          >
            خواندن همه
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            هیچ اعلانی وجود ندارد
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white dark:bg-gray-900 rounded-xl border p-4 transition ${
                !notification.isRead
                  ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <div className="text-2xl">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {getTypeLabel(notification.type)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                      >
                        مشاهده جزئیات →
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="علامت به عنوان خوانده شده"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 text-sm">
            صفحه {page} از {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
