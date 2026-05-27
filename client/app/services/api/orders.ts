// client/src/app/services/api/orders.ts

import axiosInstance from "./axios";

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  flavor?: string;
  weight?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  coupon?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: "zarinpal";
  zarinpalAuthority?: string;
  zarinpalRefId?: string;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: {
    product: string;
    quantity: number;
    flavor?: string;
    weight?: string;
  }[];
  shippingAddress: ShippingAddress;
  couponCode?: string;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const orderService = {
  // ایجاد سفارش جدید
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await axiosInstance.post("/orders", data);
    return response.data.data.order;
  },

  // دریافت سفارشات من
  getMyOrders: async (
    page: number = 1,
    limit: number = 10,
  ): Promise<OrdersResponse> => {
    const response = await axiosInstance.get(
      `/orders/my?page=${page}&limit=${limit}`,
    );
    return response.data.data;
  },

  // دریافت یک سفارش خاص
  getOrderById: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data.data.order;
  },

  // دریافت همه سفارشات (فقط ادمین)
  getAllOrders: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<OrdersResponse> => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  },

  // بروزرسانی وضعیت سفارش (فقط ادمین)
  updateOrderStatus: async (
    id: string,
    status: Order["status"],
  ): Promise<Order> => {
    const response = await axiosInstance.put(`/orders/${id}/status`, {
      status,
    });
    return response.data.data.order;
  },
};

export default orderService;
