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

// مسیرهای ادمین
const adminRoutes = ["/dashboard/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ دیباگ - لاگ کوکی‌ها
  console.log("🍪 All cookies:", request.cookies.getAll());
  console.log("📍 Pathname:", pathname);

  // خواندن توکن از کوکی
  const token = request.cookies.get("accessToken")?.value;
  const isLoggedIn = !!token;

  console.log("🔑 Token exists:", isLoggedIn);

  // تشخیص مسیرها
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // ========== لاگین نباشه و بره تو مسیر محافظت شده ==========
  if (isProtectedRoute && !isLoggedIn) {
    console.log("🚫 Redirecting to login (protected route)");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ========== لاگین نباشه و بره تو مسیر ادمین ==========
  if (isAdminRoute && !isLoggedIn) {
    console.log("🚫 Redirecting to login (admin route)");
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
    console.log("✅ Already logged in, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));
  }

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
