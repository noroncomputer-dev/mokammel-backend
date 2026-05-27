// app/(store)/page.tsx

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import HeroSlider from "@/components/sections/HeroSlider";
import TrustFeatures from "@/components/sections/TrustFeatures";
import CategoryFinder from "@/components/sections/CategoryFinder";
import BrandsAndStats from "@/components/sections/BrandsAndStats";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // اگه کاربر لاگین کرده و پیام خوش‌آمدگویی هنوز نشون داده نشده
    if (isAuthenticated && user) {
      // const welcomeShown = sessionStorage.getItem("welcomeShown");
      // if (!welcomeShown) {
      toast.success(`${user.name} عزیز خوش اومدی! 🎉`, {
        description: "ورود شما با موفقیت انجام شد",
        duration: 4000,
        position: "top-center",
        icon: "👋",
      });
      // sessionStorage.setItem("welcomeShown", "true");
      // }
    }
  }, [isAuthenticated, user]);

  return (
    <div className="space-y-12">
      <Header />
      <HeroSlider />
      <TrustFeatures />
      <CategoryFinder />
      <BrandsAndStats />
      <FeaturedProducts />
      <Footer />
    </div>
  );
}
