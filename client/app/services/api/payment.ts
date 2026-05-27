// services/api/payment.ts
import axiosInstance from "./axios";

export interface PaymentRequestResponse {
  paymentUrl: string;
  authority: string;
}

export interface PaymentVerifyResponse {
  refId: string;
  orderId: string;
}

const paymentService = {
  // درخواست پرداخت - مطابق با مسیر POST /api/payment/zarinpal
  requestPayment: async (
    orderId: string,
    amount: number,
    description?: string,
  ): Promise<PaymentRequestResponse> => {
    const response = await axiosInstance.post("/payment/zarinpal", {
      orderId,
      amount,
      description,
    });
    return response.data.data;
  },

  // تأیید پرداخت - مطابق با مسیر GET /api/payment/verify
  verifyPayment: async (
    authority: string,
    status: string,
  ): Promise<PaymentVerifyResponse> => {
    const response = await axiosInstance.get("/payment/verify", {
      params: { authority, status },
    });
    return response.data.data;
  },

  // دریافت وضعیت پرداخت یک سفارش
  getPaymentStatus: async (orderId: string): Promise<any> => {
    const response = await axiosInstance.get(`/payment/status/${orderId}`);
    return response.data;
  },
};

export default paymentService;
