"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, User, Clock, Loader2 } from "lucide-react";
import ticketService, { Ticket } from "@/services/api/tickets";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  open: "باز",
  in_progress: "در حال بررسی",
  resolved: "حل شده",
  closed: "بسته شده",
};

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  resolved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const priorityLabels: Record<string, string> = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
  urgent: "فوری",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const categoryLabels: Record<string, string> = {
  payment: "پرداخت",
  delivery: "ارسال",
  product: "محصول",
  account: "حساب کاربری",
  other: "سایر",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getTicketById(ticketId);
      setTicket(data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("خطا در دریافت اطلاعات تیکت");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error("لطفاً متن پاسخ را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      await ticketService.addReply(ticketId, replyText);
      setReplyText("");
      fetchTicket();
      toast.success("پاسخ شما با موفقیت ثبت شد");
    } catch (error) {
      toast.error("خطا در ثبت پاسخ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">تیکت یافت نشد</p>
        <Link href="/profile/tickets" className="text-blue-600 hover:underline mt-4 inline-block">
          بازگشت به تیکت‌ها
        </Link>
      </div>
    );
  }

  const canReply = ticket.status !== "closed";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر */}
      <div className="flex items-center gap-4">
        <Link
          href={isAdmin ? "/admin/tickets" : "/profile/tickets"}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
            <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {ticket.ticketNumber}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[ticket.status]}`}>
              {statusLabels[ticket.status]}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[ticket.priority]}`}>
              {priorityLabels[ticket.priority]}
            </span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {categoryLabels[ticket.category]}
            </span>
          </div>
        </div>
      </div>

      {/* پیام‌های تیکت */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
        {ticket.messages?.map((msg, idx) => {
          const isCurrentUser = msg.user === user?._id;
          const isAdminMsg = msg.isAdmin;
          
          return (
            <div
              key={idx}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : isAdminMsg
                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {isAdminMsg ? "پشتیبانی" : isCurrentUser ? user?.name : ticket.user?.name}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString("fa-IR")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* فرم پاسخ */}
      {canReply && (
        <form onSubmit={handleSendReply} className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isAdmin ? "پاسخ شما" : "پاسخ خود را وارد کنید"}
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isAdmin ? "پاسخ خود را برای کاربر بنویسید..." : "پاسخ خود را وارد کنید..."}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              ارسال پاسخ
            </button>
          </div>
        </form>
      )}

      {/* تیکت بسته شده */}
      {!canReply && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            این تیکت بسته شده است و قادر به ارسال پاسخ نیستید.
          </p>
        </div>
      )}
    </div>
  );
}