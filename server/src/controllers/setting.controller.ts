import { Request, Response } from "express";
import Setting from "../models/setting";

// دریافت تنظیمات
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      // اگر تنظیماتی وجود نداشت، پیش‌فرض ایجاد کن
      settings = await Setting.create({
        storeName: "فروشگاه مکمل",
        storeEmail: "info@example.com",
        storePhone: "02112345678",
        storeAddress: "تهران، خیابان اصلی",
        storeLogo: "",
        metaDescription: "فروشگاه آنلاین مکمل‌های ورزشی",
        metaKeywords: "مکمل، ورزشی، بدنسازی",
        maintenanceMode: false,
        allowGuestCheckout: true,
        minOrderAmount: 0,
        shippingCost: 0,
        freeShippingThreshold: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error in getSettings:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت تنظیمات",
    });
  }
};

// بروزرسانی تنظیمات
export const updateSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();

    if (!settings) {
      settings = new Setting();
    }

    // بروزرسانی فیلدها
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        (settings as any)[key] = req.body[key];
      }
    });

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
      message: "تنظیمات با موفقیت ذخیره شد",
    });
  } catch (error) {
    console.error("Error in updateSettings:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ذخیره تنظیمات",
    });
  }
};
