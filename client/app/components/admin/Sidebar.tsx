"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Percent,
  BarChart3,
  Library,
  Settings,
  MessageCircle,
  Home,
  LogOut,
  Bell,
  X,
  Image,
  UserCircle,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import api from "@/services/api/axios";
import { toast } from "sonner";

const menuItems = [
  { name: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { name: "سفارشات", href: "/admin/orders", icon: ShoppingCart },
  { name: "محصولات", href: "/admin/products", icon: Package },
  { name: "مشتریان", href: "/admin/users", icon: Users },
  { name: "تخفیف‌ها", href: "/admin/coupons", icon: Percent },
  { name: "گزارش فروش", href: "/admin/analytics", icon: BarChart3 },
  { name: "دسته بندی ها", href: "/admin/categories", icon: Library },
  { name: "برند ها", href: "/admin/brands", icon: Library },
  { name: "بنرها", href: "/admin/promos", icon: Image },
  { name: "نظرات", href: "/admin/reviews", icon: MessageCircle },
  { name: "تنظیمات", href: "/admin/settings", icon: Settings },
  { name: "پروفایل", href: "/admin/profile", icon: UserCircle },
  { name: "اسلایدر", href: "/admin/slider", icon: Image },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // بررسی وضعیت دارک مود
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    const isDark =
      savedMode === "true" ||
      document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/admin/latest");
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
        setRecentNotifications(response.data.data.notifications.slice(0, 5));
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      // ✅ اگر خطای 401 بود، فقط لاگ کن و ادامه بده (هیچ اعلانی نشان نده)
      if (error.response?.status === 401) {
        setUnreadCount(0);
        setRecentNotifications([]);
      }
    }
  };
  const markAsRead = async (notifId: string) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setRecentNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
      toast.success("همه اعلانات خوانده شد");
    } catch (error) {
      toast.error("خطا در علامت زدن اعلانات");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("با موفقیت خارج شدید");
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getUserAvatar = () => {
    if (user?.avatar) return user.avatar;
    return null;
  };

  const getUserInitial = () => user?.name?.charAt(0)?.toUpperCase() || "A";

  const SidebarContent = () => (
    <div
      className={`flex flex-col h-full overflow-hidden bg-card ${mobile ? "w-72" : ""}`}
    >
      {/* ==================== هدر سایدبار ==================== */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 group"
            onClick={() => mobile && onClose?.()}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shadow-glow transition-all duration-300 group-hover:scale-105">
              M
            </div>
            <div>
              <span className="font-bold text-foreground text-sm gold-text">
                مکمل‌شاپ
              </span>
              <p className="text-[10px] text-muted-foreground">پنل مدیریت</p>
            </div>
          </Link>
          {mobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-all duration-200"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== اطلاعات کاربر ==================== */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {getUserAvatar() ? (
            <img
              src={getUserAvatar()!}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">
              {getUserInitial()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || "ادمین"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              مدیر فروشگاه
            </p>
          </div>
        </div>
      </div>

      {/* ==================== منوی اصلی ==================== */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 ">
        {menuItems.map((item) => {
          const isActive = (() => {
            if (item.href === "/admin") {
              return pathname === "/admin";
            }
            return (
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            );
          })();

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && onClose?.()}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl 
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md border-r-2 border-primary"
                    : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5 hover:text-primary hover:shadow-sm"
                }
              `}
            >
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full shadow-glow" />
              )}
              <item.icon
                className={`
                  h-5 w-5 transition-all duration-300
                  ${
                    isActive
                      ? "text-primary drop-shadow-glow"
                      : "text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:drop-shadow-glow"
                  }
                `}
              />
              <span
                className={`
                  text-sm font-medium transition-all duration-300
                  ${
                    isActive
                      ? "text-primary font-bold tracking-wide"
                      : "text-muted-foreground group-hover:text-primary group-hover:font-semibold"
                  }
                `}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ==================== اعلانات ==================== */}
      <div className="border-t border-border">
        {mobile ? (
          <Link
            href="/admin/notifications"
            onClick={() => mobile && onClose?.()}
            className="group flex items-center gap-3 px-3 py-3 w-full text-muted-foreground hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5 hover:text-primary rounded-xl transition-all duration-300"
          >
            <Bell className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            <span className="text-sm font-medium">اعلانات</span>
            {unreadCount > 0 && (
              <span className="mr-auto bg-primary text-primary-foreground text-[10px] min-w-[18px] h-4 rounded-full flex items-center justify-center font-bold shadow-glow px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                group relative w-full flex items-center gap-3 px-3 py-2.5
                transition-all duration-300 rounded-xl mx-1 my-1
                ${
                  showNotifications
                    ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary shadow-md"
                    : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5 hover:text-primary hover:shadow-sm"
                }
              `}
            >
              <Bell
                className={`
                  h-4 w-4 transition-all duration-300
                  ${
                    showNotifications
                      ? "text-primary drop-shadow-glow"
                      : "text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:drop-shadow-glow"
                  }
                `}
              />
              <span className="text-xs font-medium transition-colors duration-300">
                اعلانات
              </span>
              {unreadCount > 0 && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] min-w-[18px] h-4 rounded-full flex items-center justify-center font-bold shadow-glow px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-card rounded-lg shadow-luxury border border-border z-50 w-40 h-20 overflow-hidden animate-fadeUp">
                  <div className="px-3 py-2 border-b border-border flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h3 className="font-semibold text-foreground text-xs">
                        اعلانات
                      </h3>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                      >
                        خواندن همه
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div className="text-center py-4">
                        <Bell className="h-6 w-6 text-muted-foreground mx-auto mb-1 opacity-50" />
                        <p className="text-[10px] text-muted-foreground">
                          هیچ اعلانی نیست
                        </p>
                      </div>
                    ) : (
                      recentNotifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`px-3 py-2 border-b border-border/50 cursor-pointer transition-all duration-200 hover:bg-muted/30 ${
                            !notif.isRead ? "bg-primary/5" : ""
                          }`}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                            if (notif.link) {
                              router.push(notif.link);
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <p className="text-xs font-medium text-foreground line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-[9px] text-muted-foreground/50 mt-1">
                            {new Date(notif.createdAt).toLocaleString("fa-IR")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-3 py-1.5 border-t border-border text-center bg-muted/30">
                    <Link
                      href="/admin/notifications"
                      onClick={() => {
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                    >
                      مشاهده همه اعلانات
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ==================== دکمه دارک مود (نسخه ساده) ==================== */}
      <div className="px-3 py-2 border-t border-border">
        <button
          onClick={toggleDarkMode}
          className="group flex items-center justify-between w-full px-3 py-2 rounded-xl text-muted-foreground hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5 hover:text-primary transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            ) : (
              <Sun className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
            )}
            <span className="text-sm font-medium">
              {isDarkMode ? "حالت روشن" : "حالت تاریک"}
            </span>
          </div>

          {/* آیکون وضعیت */}
        </button>
      </div>

      {/* ==================== خروج ==================== */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2 w-full text-rose-500 hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-rose-500/5 rounded-xl transition-all duration-300 text-sm font-medium"
        >
          <LogOut className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
          خروج
        </button>
      </div>

      {/* ==================== بازگشت به فروشگاه ==================== */}
      <div className="p-4 pt-0">
        <Link
          href="/"
          onClick={() => mobile && onClose?.()}
          className="group flex items-center gap-3 px-3 py-2 w-full text-muted-foreground hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/5 hover:text-primary rounded-xl transition-all duration-300 text-sm font-medium"
        >
          <Home className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-primary group-hover:drop-shadow-glow" />
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );

  return <SidebarContent />;
}
