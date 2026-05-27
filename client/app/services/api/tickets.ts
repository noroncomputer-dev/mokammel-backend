import axiosInstance from "./axios";

export interface TicketMessage {
  user: string;
  message: string;
  isAdmin: boolean;
  attachments?: string[];
  createdAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category: "payment" | "delivery" | "product" | "account" | "other";
  orderId?: string;
  attachments: string[];
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const ticketService = {
  // دریافت تیکت‌های من
  getMyTickets: async (
    page: number = 1,
    status?: string,
  ): Promise<TicketsResponse> => {
    const params: any = { page, limit: 10 };
    if (status) params.status = status;
    const response = await axiosInstance.get("/tickets/my", { params });
    return response.data.data;
  },

  // دریافت یک تیکت
  getTicketById: async (ticketId: string): Promise<Ticket> => {
    const response = await axiosInstance.get(`/tickets/${ticketId}`);
    return response.data.data.ticket;
  },

  // ایجاد تیکت جدید
  createTicket: async (data: {
    subject: string;
    message: string;
    category: string;
    priority?: string;
    orderId?: string;
  }): Promise<Ticket> => {
    const response = await axiosInstance.post("/tickets", data);
    return response.data.data.ticket;
  },

  // افزودن پاسخ
  addReply: async (ticketId: string, message: string): Promise<Ticket> => {
    const response = await axiosInstance.post(`/tickets/${ticketId}/reply`, {
      message,
    });
    return response.data.data.ticket;
  },

  // مدیریت ادمین
  getAllTickets: async (
    page: number = 1,
    status?: string,
  ): Promise<TicketsResponse> => {
    const params: any = { page, limit: 20 };
    if (status) params.status = status;
    const response = await axiosInstance.get("/tickets/admin/all", { params });
    return response.data.data;
  },

  updateStatus: async (ticketId: string, status: string): Promise<Ticket> => {
    const response = await axiosInstance.put(`/tickets/${ticketId}/status`, {
      status,
    });
    return response.data.data.ticket;
  },

  deleteTicket: async (ticketId: string): Promise<void> => {
    await axiosInstance.delete(`/tickets/${ticketId}`);
  },
};

export default ticketService;
