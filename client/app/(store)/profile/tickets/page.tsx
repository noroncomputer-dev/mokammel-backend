"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  MessageCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import ticketService, { Ticket } from "@/services/api/tickets";

const statusLabels: Record<string, string> = {
  open: "باز",
  in_progress: "در حال بررسی",
  resolved: "حل شده",
  closed: "بسته شده",
};

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  in_progress:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
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
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const categoryLabels: Record<string, string> = {
  payment: "پرداخت",
  delivery: "ارسال",
  product: "محصول",
  account: "حساب کاربری",
  other: "سایر",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getMyTickets(page, statusFilter);
      setTickets(data.tickets);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            درخواست‌های پشتیبانی خود را ثبت و پیگیری کنید
          </p>
        </div>
        <Link
          href="/profile/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
        >
          <Plus className="h-4 w-4" />
          تیکت جدید
        </Link>
      </div>

      {/* فیلتر وضعیت */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            statusFilter === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          همه
        </button>
        {["open", "in_progress", "resolved", "closed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            هیچ تیکتی ثبت نشده است
          </p>
          <Link
            href="/profile/tickets/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm"
          >
            ثبت تیکت جدید
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              href={`/profile/tickets/${ticket._id}`}
              className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}
                    >
                      {statusLabels[ticket.status]}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}
                    >
                      {priorityLabels[ticket.priority]}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {categoryLabels[ticket.category]}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-2 line-clamp-1">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {ticket.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {ticket.messages.length} پیام
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 text-sm">
            صفحه {page} از {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-xl disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
