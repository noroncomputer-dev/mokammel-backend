# راهنمای Deploy روی Vercel

## متغیرهای محیطی (Environment Variables)

در Vercel Dashboard → Settings → Environment Variables این متغیرها را اضافه کن:

| متغیر | مقدار |
|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://mokammel-backend.up.railway.app/api` |
| `NEXT_PUBLIC_PAYMENT_CALLBACK_URL` | `https://your-app.vercel.app/payment/verify` |

> ⚠️ **مهم:** آدرس `NEXT_PUBLIC_PAYMENT_CALLBACK_URL` را به دامنه واقعی Vercel خودت تغییر بده.

## مشکلاتی که Fix شد

1. **`next.config.ts`** - تغییر `module.exports` به `export default` (TypeScript ES Module)
2. **`middleware.ts`** - انتقال از `app/middleware/` به root پروژه (محل صحیح Next.js)
3. **`useSearchParams()` بدون Suspense** - رفع در صفحات:
   - `payment/failed/page.tsx`
   - `payment/success/page.tsx`
   - `payment/verify/page.tsx`
   - `products/page.tsx`
4. **`axios.ts`** - Guard کردن `window.location` برای SSR
5. **`auth.store.ts`** - اصلاح TypeScript interface برای `register`
6. **`globals.css`** - اضافه کردن `@config` برای Tailwind v4
7. **`vercel.json`** - اضافه شد برای تنظیمات صحیح build
