/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // غیرفعال کردن optimization برای تصاویر خارجی
    unoptimized: true,
    // یا می‌تونی دامنه‌ها رو اضافه کنی
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/images/**",
      },
    ],
  },
  // اگر از API خودت داری استفاده می‌کنی
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
