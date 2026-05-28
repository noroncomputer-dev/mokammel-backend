import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// مسیرهای محافظت شده (نیاز به لاگین)
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/orders",
  "/addresses",
  "/wishlist",
  "/checkout",
];

// مسیرهای ادمین (نیاز به لاگین + نقش ادمین)
const adminRoutes = ["/dashboard/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // خواندن توکن از کوکی
  const token = request.cookies.get("accessToken")?.value;
  const isLoggedIn = !!token;

  // تشخیص مسیرها
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // ========== لاگین نباشه و بره تو مسیر محافظت شده ==========
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ========== لاگین نباشه و بره تو مسیر ادمین ==========
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ========== لاگین کرده ولی به صفحات auth رفته ==========
  if (
    isLoggedIn &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forget-password")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ========== لاگین کرده ولی نقش ادمین نداره و میخواد بره تو مسیر ادمین ==========
  // اینجا یه راه‌حل ساده: بک‌اند توکن رو decode میکنه، ما تو middleware نمیتونیم نقش رو چک کنیم.
  // برای چک کردن نقش، باید یه API بزنی یا توکن رو decode کنی (که تو middleware ریسک داره)
  // فعلاً همین کافیه، بک‌اند خودش چک میکنه.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/addresses/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/forget-password",
  ],
};
