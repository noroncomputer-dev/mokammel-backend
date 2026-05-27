"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import notificationService, {
  Notification,
} from "@/services/api/notifications";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import axiosInstance from "./axios";
export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getMyNotifications(1, 5);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);

      // ✅ اگر خطای 401 (توکن نامعتبر) بود، لاگین کن
      if (error.response?.status === 401) {
        toast.error("لطفاً دوباره وارد حساب خود شوید");
        // پاک کردن توکن و ریدایرکت به لاگین
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
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
      toast.error("خطا در خواندن اعلانات");
    }
  };

  const handleDelete = async (notificationId: string) => {
    setDeletingId(notificationId);
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-primary/10 text-primary";
      case "review":
        return "bg-emerald-500/10 text-emerald-500";
      case "payment":
        return "bg-purple-500/10 text-purple-500";
      case "promotion":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه اعلانات کوچک */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
      >
        <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-primary-foreground bg-primary rounded-full shadow-glow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown اعلانات - نسخه فشرده */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-card bg-black rounded-lg shadow-luxury border border-border z-50 overflow-hidden animate-fadeUp">
          {/* هدر فشرده */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <h3 className="font-semibold text-foreground text-xs">اعلانات</h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
              >
                <Check className="h-2.5 w-2.5" />
                خواندن همه
              </button>
            )}
          </div>

          {/* لیست اعلانات فشرده */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4 gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin" />
                <p className="text-[10px] text-muted-foreground">بارگذاری...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                  <Bell className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  هیچ اعلانی نیست
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-b border-border/50 last:border-0 transition-all duration-200 ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="px-3 py-2 hover:bg-muted/30 transition-colors group/notif">
                    <Link
                      href={notification.link || "/admin/notifications"}
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification._id);
                        }
                        setIsOpen(false);
                      }}
                      className="block"
                    >
                      <div className="flex gap-2">
                        {/* آیکون کوچک */}
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-sm ${getTypeColor(
                            notification.type,
                          )}`}
                        >
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* محتوای فشرده */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString("fa-IR")}
                          </p>
                        </div>

                        {/* دکمه حذف کوچک */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(notification._id);
                          }}
                          disabled={deletingId === notification._id}
                          className="p-0.5 text-muted-foreground opacity-0 group-hover/notif:opacity-100 hover:text-rose-500 transition-all duration-200 disabled:opacity-50"
                        >
                          {deletingId === notification._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* لینک مشاهده همه - فشرده */}
          <div className="px-3 py-1.5 border-t border-border text-center bg-muted/30">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              مشاهده همه
              <ChevronLeft className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
