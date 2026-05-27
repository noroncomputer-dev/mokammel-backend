import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// تبدیل اعداد فارسی/عربی به انگلیسی و حذف کاماها برای نمایش خالص
export const toEnglishDigits = (str: string | number): string => {
  if (typeof str === "number") return str.toLocaleString("en-US");

  const persianNumbers = [
    /۰/g,
    /۱/g,
    /۲/g,
    /۳/g,
    /۴/g,
    /۵/g,
    /۶/g,
    /۷/g,
    /۸/g,
    /۹/g,
  ];
  const arabicNumbers = [
    /٠/g,
    /١/g,
    /٢/g,
    /٣/g,
    /٤/g,
    /٥/g,
    /٦/g,
    /٧/g,
    /٨/g,
    /٩/g,
  ];

  let result = str.toString();
  for (let i = 0; i < 10; i++) {
    result = result.replace(persianNumbers[i], i).replace(arabicNumbers[i], i);
  }
  // حذف کاماها برای اعداد بزرگ اگر نیاز به محاسبه داشتید، اما برای نمایش بهتر است نگه داریم
  // اینجا فقط تبدیل کاراکترها انجام می‌شود
  return result;
};

// فرمت قیمت به صورت انگلیسی استاندارد
export const formatPrice = (price: number): string => {
  return price.toLocaleString("en-US");
};
