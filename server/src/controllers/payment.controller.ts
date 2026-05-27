import { Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Order from "../models/order.model";
import { AuthRequest } from "../middleware/auth.middleware";

// نسخه ساده برای تست (بدون اتصال واقعی به زرین‌پال)
export const requestPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId, amount, description } = req.body;

    console.log("📦 Mock Payment request:", { orderId, amount, description });

    if (!orderId) {
      res.status(400).json(apiResponse(false, "شناسه سفارش الزامی است"));
      return;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json(apiResponse(false, "سفارش یافت نشد"));
      return;
    }

    // شبیه‌سازی پرداخت موفق
    const mockAuthority = `AUTH-${Date.now()}`;

    await Order.findByIdAndUpdate(orderId, {
      zarinpalAuthority: mockAuthority,
      paymentStatus: "paid",
      status: "processing",
      zarinpalRefId: mockAuthority,
      paidAt: new Date(),
    });

    // ریدایرکت مستقیم به صفحه موفقیت
    const successUrl = `http://localhost:3050/payment/success?orderId=${orderId}&refId=${mockAuthority}`;

    res.json(
      apiResponse(true, "پرداخت با موفقیت انجام شد", {
        paymentUrl: successUrl,
        authority: mockAuthority,
      }),
    );
  },
);

export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { Authority, Status, orderId } = req.query as {
      Authority?: string;
      Status?: string;
      orderId?: string;
    };

    console.log("✅ Verify callback:", { Authority, Status, orderId });

    if (Status !== "OK" || !Authority) {
      return res.redirect(
        `http://localhost:3050/payment/failed?orderId=${orderId || ""}`,
      );
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      status: "processing",
      zarinpalRefId: Authority,
      paidAt: new Date(),
    });

    return res.redirect(
      `http://localhost:3050/payment/success?orderId=${orderId}&refId=${Authority}`,
    );
  },
);

export const getPaymentStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    res.json(
      apiResponse(true, "وضعیت پرداخت", {
        status: order?.paymentStatus || "not_found",
        amount: order?.finalPrice || 0,
        refId: order?.zarinpalRefId,
        orderStatus: order?.status,
        paymentStatus: order?.paymentStatus,
      }),
    );
  },
);
