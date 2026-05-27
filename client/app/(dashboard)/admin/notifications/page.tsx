"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Ticket,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import api from "@/services/api/axios";
import { toast } from "sonner";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications", {
        params: { page, limit: 15 },
      });
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("خطا در دریافت اعلانات");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId: string) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("اعلان خوانده شد");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("خطا در ثبت خوانده شدن");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("همه اعلانات خوانده شد");
    } catch (error) {
      toast.error("خطا در علامت زدن اعلانات");
    }
  };

  const deleteNotification = async (notifId: string) => {
    setDeletingId(notifId);
    try {
      await api.delete(`/notifications/${notifId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      toast.success("اعلان حذف شد");
    } catch (error) {
      toast.error("خطا در حذف اعلان");
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-5 w-5" />;
      case "review":
        return <MessageCircle className="h-5 w-5" />;
      case "ticket":
        return <Ticket className="h-5 w-5" />;
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-primary/10 text-primary";
      case "review":
        return "bg-emerald-500/10 text-emerald-500";
      case "ticket":
        return "bg-amber-500/10 text-amber-500";
      case "payment":
        return "bg-purple-500/10 text-purple-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // کلاس‌های استایل طلایی
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm";

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">اعلانات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت و پیگیری اعلانات فروشگاه
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="badge-gold bg-primary/10 text-primary">
              <Bell className="h-3 w-3 inline ml-1" />
              {unreadCount} اعلان خوانده نشده
            </div>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-gold-outline px-4 py-2 text-sm font-medium flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              خواندن همه
            </button>
          )}
        </div>
      </div>

      {/* ==================== لیست اعلانات لوکس ==================== */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            </div>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 card-luxury">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">هیچ اعلانی وجود ندارد</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            با ثبت سفارش‌های جدید، اعلانات در اینجا نمایش داده می‌شوند
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <div
              key={notif._id}
              className={`group card-luxury p-4 transition-all duration-300 ${
                !notif.isRead
                  ? "bg-primary/5 border-primary/30 hover:shadow-gold"
                  : "hover:shadow-md"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex gap-3 flex-1">
                  {/* آیکون با رنگ نوع اعلان */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getTypeColor(
                      notif.type,
                    )} transition-transform duration-300 group-hover:scale-110`}
                  >
                    {getTypeIcon(notif.type)}
                  </div>

                  {/* محتوای اعلان */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-foreground">
                        {notif.title}
                      </h3>
                      <span className="text-xs text-muted-foreground/60">
                        {new Date(notif.createdAt).toLocaleString("fa-IR")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-3 transition-colors"
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif._id);
                        }}
                      >
                        مشاهده جزئیات
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex gap-2 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200 hover:scale-110"
                      title="علامت به عنوان خوانده شده"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    disabled={deletingId === notif._id}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="حذف"
                  >
                    {deletingId === notif._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== صفحه‌بندی طلایی ==================== */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            صفحه <span className="text-primary font-medium">{page}</span> از{" "}
            {totalPages}
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              قبلی
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-1"
            >
              بعدی
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
