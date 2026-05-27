"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  Moon,
  Sun,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // ✅ اضافه کردن useRouter
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/ui/NotificationBell";

const NAV_LINKS = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/products", label: "محصولات" },
  { href: "/categories", label: "دسته‌بندی" },
  { href: "/blog", label: "مجله" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/faq", label: "سوالات متداول" },
];

export default function Header() {
  const router = useRouter(); // ✅ اضافه کردن router
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ✅ state برای مقدار جستجو در دسکتاپ و موبایل
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");

  const { theme, setTheme } = useTheme();
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const totalItems = isMounted ? getTotalItems() : 0;
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      )
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ✅ تابع جستجو
  const handleSearch = (e: React.FormEvent, searchQuery: string) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getUserAvatar = () => user?.avatar || null;
  const getUserInitial = () => user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full
          bg-white border-b border-border/40 border-gray-200
          dark:bg-black dark:border-gray-900"
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow group-hover:shadow-gold transition-all duration-300">
              <span className="text-primary-foreground font-black text-sm">
                M
              </span>
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                مکمل‌شاپ
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 tracking-wider font-semibold uppercase">
                Mokammel.ir
              </p>
            </div>
          </Link>

          {/* Search Bar - دسکتاپ */}
          <form
            onSubmit={(e) => handleSearch(e, desktopSearchQuery)}
            className="hidden md:flex flex-1 max-w-sm xl:max-w-md relative group"
          >
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-gold-500 transition-colors" />
            <input
              type="text"
              value={desktopSearchQuery}
              onChange={(e) => setDesktopSearchQuery(e.target.value)}
              placeholder="جستجوی مکمل، برند، دسته‌بندی..."
              className="w-full h-10 rounded-xl text-sm
                bg-gray-50 dark:bg-black 
                border border-gray-200 dark:border-gray-800
                text-gray-900 dark:text-white 
                placeholder-gray-400 dark:placeholder-gray-500
                pr-10 pl-4
                focus:outline-none focus:border-gold-500
                focus:ring-2 focus:ring-gold-500/20
                focus:bg-white dark:focus:black
                transition-all duration-200"
            />
          </form>

          <div className="flex-1 md:hidden" />

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl transition-all duration-300 group
                hover:bg-gold-500/10 text-gray-600 dark:text-gray-400 hover:text-gold-500"
            >
              <ShoppingCart className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-gold-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <button className="p-2.5 rounded-xl transition-all duration-300 group hover:bg-gold-500/10">
              <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:text-rose-500" />
            </button>

            <NotificationBell />

            {/* Theme Toggle */}
            {isMounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-xl transition-all duration-300 hover:bg-gold-500/10 group"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-500 transition-all duration-300 group-hover:scale-110" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:text-gold-500" />
                )}
              </button>
            )}

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

            {/* User Menu */}
            {isMounted && isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`flex items-center gap-2 h-9 px-2.5 rounded-xl transition-all duration-300 ${
                    userMenuOpen
                      ? "bg-gold-500/10 text-gold-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gold-500/10 hover:text-gold-500"
                  }`}
                >
                  {getUserAvatar() ? (
                    <img
                      src={getUserAvatar()!}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-gold-500/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {getUserInitial()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-semibold max-w-[72px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown
                    className={`hidden md:block w-3.5 h-3.5 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180 text-gold-500" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 top-12 w-56 bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        {getUserAvatar() ? (
                          <img
                            src={getUserAvatar()!}
                            alt={user?.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-500/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {getUserInitial()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {[
                        { href: "/profile", icon: User, label: "پروفایل" },
                        {
                          href: "/profile/orders",
                          icon: Package,
                          label: "سفارشات",
                        },
                        ...(user?.role === "admin"
                          ? [
                              {
                                href: "/admin",
                                icon: Settings,
                                label: "پنل مدیریت",
                              },
                            ]
                          : []),
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            text-gray-700 dark:text-gray-300 hover:bg-gold-500/10 hover:text-gold-500"
                        >
                          <Icon className="w-4 h-4 transition-all duration-200 group-hover:scale-110" />
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                          text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="w-4 h-4" />
                        خروج از حساب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 h-9 px-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-gold"
              >
                <User className="w-4 h-4" />
                ورود / ثبت‌نام
              </Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl transition-all duration-300 hover:bg-gold-500/10 group"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* ==================== ناوبری دسکتاپ ==================== */}
        <nav className="hidden lg:block border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1 h-11">
              {NAV_LINKS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group relative px-4 py-1.5 rounded-lg text-sm font-semibold
                      transition-all duration-300 ease-out
                      ${
                        isActive
                          ? "text-primary bg-primary/10 shadow-sm"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      }
                    `}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full" />
                    )}
                    <span
                      className={`
                        absolute bottom-0 right-0 w-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full 
                        transition-all duration-300 ease-out group-hover:w-full
                        ${isActive ? "hidden" : ""}
                      `}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <div
          dir="rtl"
          className={`fixed top-0 right-0 h-full w-[320px] bg-white dark:bg-black z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-black shadow-md group-hover:shadow-gold transition-all duration-300">
                M
              </div>
              <span className="font-black gold-text text-base">مکمل‌شاپ</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 dark:bg-black border-b border-gray-100 dark:border-gray-800">
              {getUserAvatar() ? (
                <img
                  src={getUserAvatar()!}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                  {getUserInitial()}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          {/* ✅ جستجوی موبایل - فرم با submit */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <form
              onSubmit={(e) => {
                handleSearch(e, mobileSearchQuery);
                setMobileOpen(false);
              }}
              className="relative"
            >
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" />
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="جستجو..."
                className="w-full h-10 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl pr-9 pl-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
              />
            </form>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm
                    ${
                      isActive
                        ? "text-gold-500 bg-gold-500/10"
                        : "text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10"
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 text-sm font-medium transition-all"
                >
                  <User className="w-4 h-4" /> پروفایل
                </Link>
                <Link
                  href="/profile/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 text-sm font-medium transition-all"
                >
                  <Package className="w-4 h-4" /> سفارشات
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gold-500 hover:bg-gold-500/10 text-sm font-medium transition-all"
                  >
                    <Settings className="w-4 h-4" /> پنل مدیریت
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium transition-all"
                >
                  <LogOut className="w-4 h-4" /> خروج از حساب
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-sm font-semibold transition-all shadow-md hover:shadow-gold"
                >
                  ورود به حساب
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-3 rounded-xl border border-gold-500 text-gold-500 hover:bg-gold-500/10 text-sm font-semibold transition-all"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
