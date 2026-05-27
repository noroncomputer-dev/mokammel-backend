"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MessageCircle,
  MapPin,
  LogOut,
  Settings,
  Bell,
  Menu,
  X,
  Home,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const menuItems = [
  { href: "/profile", icon: User, label: "داشبورد", mobileOnly: false },
  {
    href: "/profile/orders",
    icon: Package,
    label: "سفارشات من",
    mobileOnly: false,
  },
  {
    href: "/profile/wishlist",
    icon: Heart,
    label: "علاقه‌مندی‌ها",
    mobileOnly: false,
  },
  {
    href: "/profile/tickets",
    icon: MessageCircle,
    label: "پشتیبانی",
    mobileOnly: false,
  },
  {
    href: "/profile/addresses",
    icon: MapPin,
    label: "آدرس‌ها",
    mobileOnly: false,
  },
  {
    href: "/profile/notifications",
    icon: Bell,
    label: "اعلانات",
    mobileOnly: false,
  },
  {
    href: "/profile/settings",
    icon: Settings,
    label: "تنظیمات",
    mobileOnly: false,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
    }
  }, [isAuthenticated, router]);

  // قفل کردن اسکرول هنگام باز بودن سایدبار در موبایل
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("با موفقیت خارج شدید");
  };

  if (!isMounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* دکمه منو در موبایل */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full justify-center"
          >
            <Menu className="h-5 w-5" />
            <span className="text-sm font-medium">منو حساب کاربری</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* سایدبار - دسکتاپ */}
          <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              {/* هدر سایدبار */}
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* منوی سایدبار */}
              <nav className="p-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                        ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* دکمه خروج */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  خروج از حساب
                </button>
              </div>
            </div>
          </aside>

          {/* سایدبار موبایل - Drawer */}
          <>
            {/* اوورلی */}
            <div
              className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
                sidebarOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setSidebarOpen(false)}
            />

            {/* دراور */}
            <div
              className={`
                fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl
                transform transition-transform duration-300 ease-out lg:hidden
                flex flex-col
                ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
              `}
            >
              {/* هدر دراور */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* منوی دراور */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* دکمه خروج در دراور */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-sm font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  خروج از حساب
                </button>
              </div>
            </div>
          </>

          {/* محتوای اصلی */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
