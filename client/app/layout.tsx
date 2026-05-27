// app/layout.tsx
import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

const vazir = Vazirmatn({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "مکمل‌شاپ | فروشگاه تخصصی مکمل ورزشی",
  description: "خرید آنلاین مکمل‌های اورجینال با ضمانت اصالت و ارسال فوری",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazir.className} bg-background text-foreground transition-colors duration-300`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster
            position="bottom-left"
            richColors
            toastOptions={{
              style: {
                fontFamily: "Vazirmatn, sans-serif",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
