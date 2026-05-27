// app/(auth)/layout.tsx
// صفحات auth طراحی مستقل دارند (تاریک هاردکد) - بدون Header/Footer اصلی

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
