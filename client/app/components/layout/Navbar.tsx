import { useState, useEffect } from "react";
import { User, X, LogOut, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/products", label: "محصولات" },
  { href: "/categories", label: "دسته‌بندی" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/faq", label: "سوالات متداول" },
];
export const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = isMounted ? getTotalItems() : 0;

  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const getUserInitial = () => user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div>
      {" "}
      <div className="glass border-b border-gray-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        {/* Navigation Desktop */}
        <nav className="hidden lg:block border-t border-gray-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-8 h-12 text-sm font-medium">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors py-1 border-b-2 border-transparent hover:border-brand-500"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" dir="rtl">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[300px] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-black">
                  M
                </div>
                <span className="font-black gradient-text text-lg">
                  مکمل‌شاپ
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden">
                  {getUserInitial()}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <User size={18} /> پروفایل
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <Package size={18} /> سفارشات
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Settings size={18} /> پنل مدیریت
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut size={18} /> خروج از حساب
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all">
                      ورود به حساب
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 rounded-2xl border-2 border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-bold hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
                      ثبت‌نام
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};
