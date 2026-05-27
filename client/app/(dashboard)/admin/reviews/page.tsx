"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  MessageCircle,
  Trash2,
  Loader2,
  Eye,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Send,
  Sparkles,
} from "lucide-react";
import reviewService from "@/services/api/reviews";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [filter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviews(filter, page);
      setReviews(data.reviews);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("خطا در دریافت نظرات");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewService.approveReview(reviewId);
      toast.success("نظر با موفقیت تأیید شد");
      fetchReviews();
    } catch (error) {
      toast.error("خطا در تأیید نظر");
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("لطفاً متن پاسخ را وارد کنید");
      return;
    }
    try {
      await reviewService.replyToReview(reviewId, replyText);
      toast.success("پاسخ با موفقیت ثبت شد");
      setReplyText("");
      setReplyingTo(null);
      fetchReviews();
    } catch (error) {
      toast.error("خطا در ثبت پاسخ");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("آیا از حذف این نظر اطمینان دارید؟")) return;
    try {
      await reviewService.deleteReview(reviewId);
      toast.success("نظر با موفقیت حذف شد");
      fetchReviews();
    } catch (error) {
      toast.error("خطا در حذف نظر");
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
      />
    ));
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    return (
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (isApproved: boolean) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle className="h-3 w-3" />
          تأیید شده
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
        <Clock className="h-3 w-3" />
        در انتظار تأیید
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* هدر */}
      <div>
        <div className="inline-flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
            مدیریت نظرات
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          مدیریت نظرات
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
          تأیید، پاسخ و مدیریت نظرات کاربران
        </p>
      </div>

      {/* فیلترها و جستجو */}
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setFilter("pending");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === "pending"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            در انتظار تأیید
            <span className="mr-1 text-xs opacity-70">
              ({reviews.filter((r) => !r.isApproved).length})
            </span>
          </button>
          <button
            onClick={() => {
              setFilter("approved");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === "approved"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            تأیید شده
            <span className="mr-1 text-xs opacity-70">
              ({reviews.filter((r) => r.isApproved).length})
            </span>
          </button>
        </div>

        {/* جستجو */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو در نظرات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 bg-white dark:bg-black transition-all"
          />
        </div>
      </div>

      {/* لیست نظرات */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-800 border-t-gold-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-gold-500 animate-pulse" />
            </div>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-500">
            {searchTerm ? "نظری با این عبارت یافت نشد" : "نظری وجود ندارد"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-gold-500/30 transition-all"
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                {/* اطلاعات کاربر و محصول */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-white text-sm font-bold">
                        {review.user?.name?.charAt(0) || "ک"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {review.user?.name || "کاربر ناشناس"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {review.user?.email || "ایمیل ثبت نشده"}
                        </div>
                      </div>
                    </div>

                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />

                    <Link
                      href={`/admin/products/${review.product?._id}`}
                      className="text-sm text-gold-500 hover:text-gold-600 truncate max-w-[200px] transition-colors"
                    >
                      {review.product?.name}
                    </Link>
                  </div>

                  {/* امتیاز و عنوان */}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      ({review.rating} از 5)
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        خرید تایید شده
                      </span>
                    )}
                    {getStatusBadge(review.isApproved)}
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mt-3">
                    {review.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm leading-relaxed">
                    {review.comment}
                  </p>

                  {/* تاریخ */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(review.createdAt).toLocaleDateString("fa-IR")}
                    <span className="mx-1">•</span>
                    {new Date(review.createdAt).toLocaleTimeString("fa-IR")}
                  </div>

                  {/* پاسخ ادمین موجود */}
                  {review.adminReply && (
                    <div className="mt-3 p-3 bg-gold-500/5 border border-gold-500/20 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gold-600 dark:text-gold-400 font-medium">
                        <MessageCircle className="h-4 w-4" />
                        پاسخ فروشگاه ({review.adminReply.adminName})
                      </div>
                      <p className="text-sm text-gold-600 dark:text-gold-400 mt-1">
                        {review.adminReply.comment}
                      </p>
                      <span className="text-xs text-gold-500 mt-2 block">
                        {new Date(
                          review.adminReply.createdAt,
                        ).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  )}
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition"
                      title="تأیید نظر"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === review._id ? null : review._id,
                      )
                    }
                    className="p-2 text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-950/20 rounded-xl transition"
                    title="پاسخ به نظر"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <Link
                    href={`/product/${review.product?.slug}`}
                    target="_blank"
                    className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                    title="مشاهده در سایت"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition"
                    title="حذف نظر"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* فرم پاسخ */}
              {replyingTo === review._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    پاسخ شما
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="پاسخ خود را برای این نظر بنویسید..."
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all bg-white dark:bg-black"
                    rows={3}
                  />
                  <div className="flex gap-3 mt-3 justify-end">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium hover:border-gold-500 transition-all"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => handleReply(review._id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white text-sm font-semibold transition-all shadow-md flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      ارسال پاسخ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* صفحه‌بندی */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium disabled:opacity-40 hover:border-gold-500 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-500">
            صفحه {page} از {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium disabled:opacity-40 hover:border-gold-500 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
