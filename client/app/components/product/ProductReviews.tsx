"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  Star,
  MessageCircle,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import reviewService, { Review, ReviewStats } from "@/services/api/reviews";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
  productName?: string; // ✅ اضافه کردن productName به props
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const userReview = reviews.find((r) => r.user?._id === user?._id);
  const isUserReview = (review: Review) => review.user?._id === user?._id;

  useEffect(() => {
    fetchReviews();
  }, [productId, page, selectedRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getProductReviews(
        productId,
        page,
        10,
        selectedRating || undefined,
      );
      const uniqueReviews = data.reviews.filter(
        (review, index, self) =>
          index === self.findIndex((r) => r._id === review._id),
      );
      setReviews(uniqueReviews);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await reviewService.createOrUpdateReview({
        productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
      });

      toast.success(`نظر شما برای ${productName || "محصول"} با موفقیت ثبت شد`);
      setShowForm(false);
      setFormData({ rating: 5, title: "", comment: "" });

      setReviews((prevReviews) => {
        const existingIndex = prevReviews.findIndex(
          (r) => r._id === newReview._id,
        );
        if (existingIndex >= 0) {
          const newReviews = [...prevReviews];
          newReviews[existingIndex] = newReview;
          return newReviews;
        } else {
          return [newReview, ...prevReviews];
        }
      });

      if (stats) {
        const newStats = { ...stats };
        if (!userReview) {
          newStats.total += 1;
          const ratingKey = `rating${formData.rating}` as keyof ReviewStats;
          newStats[ratingKey] = (newStats[ratingKey] as number) + 1;
          let totalRatingSum = 0;
          let totalCount = 0;
          [1, 2, 3, 4, 5].forEach((r) => {
            const count =
              (newStats[`rating${r}` as keyof ReviewStats] as number) || 0;
            totalRatingSum += r * count;
            totalCount += count;
          });
          newStats.avgRating = totalCount > 0 ? totalRatingSum / totalCount : 0;
          setStats(newStats);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message;
      toast.error(message || "خطا در ثبت نظر");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
      />
    ));
  };

  const RatingBar = ({
    rating,
    count,
    total,
  }: {
    rating: number;
    count: number;
    total: number;
  }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-8 text-muted-foreground">{rating} ستاره</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-12 text-xs text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      </div>
    );
  };

  return (
    <div className="mt-12 border-t border-border pt-8" dir="rtl">
      <h3 className="text-xl font-bold text-foreground mb-6">
        نظرات و امتیازات ({stats?.total || 0})
      </h3>

      <div className="grid md:grid-cols-3 gap-8">
        {/* ==================== سمت چپ - آمار امتیازات ==================== */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="text-center">
            <div className="text-5xl font-bold gold-text">
              {stats?.avgRating?.toFixed(1) || "۰"}
            </div>
            <div className="flex justify-center my-3">
              {renderStars(Math.round(stats?.avgRating || 0))}
            </div>
            <div className="text-sm text-muted-foreground">
              بر اساس {stats?.total || 0} نظر
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  setSelectedRating(selectedRating === rating ? null : rating)
                }
                className="w-full text-right hover:opacity-80 transition"
              >
                <RatingBar
                  rating={rating}
                  count={
                    (stats?.[
                      `rating${rating}` as keyof ReviewStats
                    ] as number) || 0
                  }
                  total={stats?.total || 0}
                />
              </button>
            ))}
          </div>

          {selectedRating && (
            <button
              onClick={() => setSelectedRating(null)}
              className="mt-4 text-sm text-primary hover:text-primary/80 w-full text-center transition"
            >
              حذف فیلتر
            </button>
          )}
        </div>

        {/* ==================== سمت راست ==================== */}
        <div className="md:col-span-2">
          {/* پیام نظر قبلی کاربر */}
          {userReview && !showForm && (
            <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  شما قبلاً نظری برای این محصول ثبت کرده‌اید.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormData({
                    rating: userReview.rating,
                    title: userReview.title,
                    comment: userReview.comment,
                  });
                  setShowForm(true);
                }}
                className="mt-2 text-sm text-primary hover:text-primary/80 transition"
              >
                ویرایش نظر
              </button>
            </div>
          )}

          {/* دکمه نوشتن نظر */}
          {!showForm && !userReview && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 px-5 py-2.5 btn-gold text-sm font-medium shadow-md"
            >
              نوشتن نظر
            </button>
          )}

          {/* فرم ثبت نظر */}
          {showForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-card rounded-2xl border border-border p-6 mb-8 shadow-sm"
            >
              <h4 className="font-bold gold-text text-lg mb-4">
                {userReview ? "ویرایش نظر" : "ثبت نظر جدید"}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    امتیاز شما
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, rating: star })
                        }
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    عنوان نظر
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="مثلاً: محصول عالی بود"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    متن نظر
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="نظر خود را بنویسید..."
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      if (!userReview) {
                        setFormData({ rating: 5, title: "", comment: "" });
                      }
                    }}
                    className="px-5 py-2 btn-gold-outline text-sm font-medium"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 btn-gold text-sm font-medium shadow-md disabled:opacity-50"
                  >
                    {submitting
                      ? "در حال ثبت..."
                      : userReview
                        ? "ویرایش نظر"
                        : "ثبت نظر"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* لیست نظرات */}
          {loading ? (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                هنوز نظری برای این محصول ثبت نشده است.
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                اولین نفری باشید که نظر می‌دهید!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => {
                const isMyReview = isUserReview(review);
                return (
                  <div
                    key={review._id}
                    className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
                      isMyReview
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shadow-glow">
                          {review.user?.name?.charAt(0) || "ک"}
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2 flex-wrap">
                            {review.user?.name || "کاربر ناشناس"}
                            {isMyReview && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                نظر شما
                              </span>
                            )}
                            {review.isVerifiedPurchase && (
                              <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                خرید تایید شده
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(review.createdAt).toLocaleDateString(
                                "fa-IR",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold text-foreground mt-3">
                      {review.title}
                    </h4>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {review.comment}
                    </p>

                    {/* وضعیت تأیید */}
                    {isMyReview && !review.isApproved && (
                      <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          این نظر در انتظار تأیید ادمین است.
                        </p>
                      </div>
                    )}

                    {/* پاسخ ادمین */}
                    {review.adminReply && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <MessageCircle className="h-4 w-4" />
                          پاسخ فروشگاه ({review.adminReply.adminName})
                        </div>
                        <p className="text-sm text-primary/80 mt-2">
                          {review.adminReply.comment}
                        </p>
                        <span className="text-xs text-primary/60 mt-2 block">
                          {new Date(
                            review.adminReply.createdAt,
                          ).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* صفحه‌بندی */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
              >
                قبلی
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                صفحه {page} از {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
