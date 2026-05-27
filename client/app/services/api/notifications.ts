import axiosInstance from "./axios";

export interface Notification {
  _id: string;
  user: string;
  type: "order" | "review" | "system" | "promotion" | "payment";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const notificationService = {
  // دریافت اعلانات من
  getMyNotifications: async (
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<NotificationsResponse> => {
    const response = await axiosInstance.get("/notifications", {
      params: { page, limit, unreadOnly },
    });
    return response.data.data;
  },

  // علامت زدن یک اعلان به عنوان خوانده شده
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await axiosInstance.put(
      `/notifications/${notificationId}/read`,
    );
    return response.data.data.notification;
  },

  // علامت زدن همه اعلانات به عنوان خوانده شده
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put("/notifications/read-all");
  },

  // حذف یک اعلان
  deleteNotification: async (notificationId: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  },
};

export default notificationService;
