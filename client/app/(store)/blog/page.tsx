"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import postService, { Post } from "@/services/api/posts";

const categoryLabels: Record<string, string> = {
  nutrition: "تغذیه",
  training: "تمرین",
  supplements: "مکمل",
  lifestyle: "سبک زندگی",
};

const categoryColors: Record<string, string> = {
  nutrition:
    "badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  training: "badge-gold bg-primary/10 text-primary border-primary/20",
  supplements:
    "badge-gold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  lifestyle:
    "badge-gold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

const getValidImageUrl = (url: string | undefined): string => {
  if (!url || url === "" || url === "null" || url === "undefined") {
    return "/blog-placeholder.jpg";
  }
  return url;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedCategory) {
        data = await postService.getPostsByCategory(selectedCategory, page);
      } else {
        data = await postService.getPublishedPosts(page, 9);
      }
      setPosts(data.posts);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPosts();
      return;
    }
    setLoading(true);
    try {
      const results = await postService.searchPosts(searchQuery);
      setPosts(results);
      setTotalPages(1);
    } catch (error) {
      console.error("Error searching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const getImageSrc = (image: string | undefined, id: string) => {
    if (imgErrors[id]) return "/blog-placeholder.jpg";
    return getValidImageUrl(image);
  };

  const categories = [
    { value: "", label: "همه" },
    { value: "nutrition", label: "تغذیه" },
    { value: "training", label: "تمرین" },
    { value: "supplements", label: "مکمل" },
    { value: "lifestyle", label: "سبک زندگی" },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors" dir="rtl">
      {/* ==================== Hero Section ==================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-b border-border py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,160,17,0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              مجله آموزشی
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
            مجله <span className="gold-text">مکمل‌شاپ</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            جدیدترین مقالات آموزشی در زمینه تغذیه ورزشی، مکمل‌ها و تمرین
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* ==================== جستجو و فیلتر ==================== */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="جستجو در مقالات..."
              className="w-full px-4 py-3 pr-10 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? "btn-gold shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== مقالات ==================== */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">مقاله‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden bg-muted/50">
                  <img
                    src={getImageSrc(post.image, post._id)}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => handleImageError(post._id)}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${categoryColors[post.category]}`}
                    >
                      {categoryLabels[post.category]}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views} بازدید
                    </span>
                    <span className="text-sm text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      ادامه مطلب ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ==================== صفحه‌بندی ==================== */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              صفحه {page} از {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
