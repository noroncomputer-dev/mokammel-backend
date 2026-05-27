import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Subscriber from "../models/subscriber.model";
import { AuthRequest } from "../middleware/auth.middleware";

// اشتراک خبرنامه
export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json(apiResponse(false, "ایمیل الزامی است"));
    return;
  }

  const existing = await Subscriber.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
      res.json(apiResponse(true, "اشتراک شما با موفقیت فعال شد"));
      return;
    }
    res.status(400).json(apiResponse(false, "این ایمیل قبلاً ثبت شده است"));
    return;
  }

  await Subscriber.create({ email });
  res.json(apiResponse(true, "اشتراک شما با موفقیت ثبت شد"));
});

// لغو اشتراک
export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params as { email?: string };

  if (!email) {
    res.status(400).json(apiResponse(false, "ایمیل الزامی است"));
    return;
  }

  await Subscriber.findOneAndUpdate({ email }, { isActive: false });
  res.json(apiResponse(true, "اشتراک شما با موفقیت لغو شد"));
});

// دریافت لیست مشترکین (ادمین)
export const getSubscribers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subscribers = await Subscriber.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      apiResponse(true, "لیست مشترکین با موفقیت دریافت شد", { subscribers }),
    );
  },
);
