"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, Sparkles } from "lucide-react";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/login");
      }
      setIsChecking(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  const openSidebar = () => {
    setSidebarOpen(true);
    setIsClosing(false);
  };

  const closeSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSidebarOpen(false);
      setIsClosing(false);
    }, 1000);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          در حال بارگذاری...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-background" dir="rtl">
      {/* سایدبار دسکتاپ */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-card border-l border-border sticky top-0 h-screen overflow-y-auto shadow-premium">
        <Sidebar />
      </aside>

      {/* دکمه منوی موبایل (شناور طلایی) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={openSidebar}
          className="p-3.5 rounded-full bg-primary text-primary-foreground shadow-gold hover:shadow-gold-strong transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* سایدبار موبایل (از راست وارد می‌شود - چون فارسی است) */}
      {(sidebarOpen || isClosing) && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* بکدراپ */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-1000 ease-out ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeSidebar}
          />

          {/* سایدبار - از راست وارد و خارج می‌شود */}
          <div
            className={`fixed top-0 right-0 h-full w-72 shadow-2xl transition-all duration-1000 ease-out ${
              isClosing ? "translate-x-full" : "translate-x-0"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionProperty: "transform",
            }}
          >
            <Sidebar mobile onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* محتوای اصلی */}
      <main className="flex-1 min-w-0 overflow-auto p-4 lg:p-8">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
