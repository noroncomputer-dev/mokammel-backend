"use client";

import {
  ChevronDown,
  ShieldCheck,
  Truck,
  Dumbbell,
  Zap,
  Flame,
  Star,
  Leaf,
  Heart,
  Activity,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MainNav() {
  return (
    <div
      className="bg-white border-b border-gray-100 shadow-sm relative z-40"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* منوی اصلی */}
          <nav className="flex items-center gap-8 text-sm font-bold text-gray-700">
            {/*  آیتم دسته‌بندی‌ها با مگا منو */}
            <div className="group relative h-14 flex items-center cursor-pointer">
              <span className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                دسته‌بندی‌ها
                <ChevronDown
                  size={16}
                  className="group-hover:rotate-180 transition-transform duration-300"
                />
              </span>

              {/* 🟦 مگا منو (فقط با Hover فعال میشه) */}
              <div className="absolute top-full right-0 w-[850px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                <div className="flex gap-8">
                  {/* ستون ۱: پروتئین */}
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-blue-700 font-bold mb-4 pb-2 border-b border-blue-50">
                      <Dumbbell size={18} /> پروتئین
                    </h3>
                    <ul className="space-y-3 text-gray-600 font-medium text-sm">
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          پروتئین وی
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          ایزوله
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          کازئین
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          پروتئین گیاهی
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* ستون ۲: عضله‌سازی */}
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-blue-700 font-bold mb-4 pb-2 border-b border-blue-50">
                      <Zap size={18} /> عضله‌سازی
                    </h3>
                    <ul className="space-y-3 text-gray-600 font-medium text-sm">
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          کراتین
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          BCAA
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          گلوتامین
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          آمینو
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* ستون ۳: چربی‌سوز */}
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 text-blue-700 font-bold mb-4 pb-2 border-b border-blue-50">
                      <Flame size={18} /> چربی‌سوز
                    </h3>
                    <ul className="space-y-3 text-gray-600 font-medium text-sm">
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          ترموژنیک
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          ال-کارنیتین
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          CLA
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="hover:text-blue-600 hover:translate-x-[-4px] transition-all block"
                        >
                          کاهش وزن
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* سایر لینک‌ها */}
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-700 transition-colors"
            >
              <Star size={16} className="text-yellow-500" /> تخفیف‌ها
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-700 transition-colors"
            >
              برندها
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-700 transition-colors"
            >
              مقالات
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-700 transition-colors"
            >
              تماس
            </Link>
          </nav>

          {/* بج‌های اعتماد */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
              <ShieldCheck size={15} className="text-blue-600" /> ضمانت اصالت
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
              <Truck size={15} className="text-blue-600" /> ارسال فوری
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
