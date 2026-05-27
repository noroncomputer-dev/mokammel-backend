"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, Clock, ArrowLeft, Tag, Sparkles } from "lucide-react";
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

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!slug) {
      setError("آدرس مقاله نامعتبر است");
      setLoading(false);
      return;
    }
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postService.getPostBySlug(slug);
      setPost(data);

      if (data.category && data._id) {
        const related = await postService.getRelatedPosts(
          data.category,
          data._id,
        );
        setRelatedPosts(related);
      }
    } catch (error: any) {
      console.error("Error fetching post:", error);
      setError(error.response?.data?.message || "مقاله یافت نشد");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-16 bg-background min-h-screen">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-4">
          <Sparkles className="h-6 w-6 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-foreground">
          {error || "مقاله یافت نشد"}
        </h1>
        <Link
          href="/blog"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          بازگشت به مجله
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ==================== بازگشت ==================== */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-all duration-300 hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت به مجله
        </Link>

        {/* ==================== تصویر شاخص ==================== */}
        <div className="rounded-2xl overflow-hidden mb-6 border border-border bg-card">
          <img
            src={getImageSrc(post.image, "main")}
            alt={post.title}
            className="w-full h-auto object-cover"
            onError={() => handleImageError("main")}
          />
        </div>

        {/* ==================== دسته‌بندی و اطلاعات ==================== */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span
            className={`text-xs px-3 py-1 rounded-full ${categoryColors[post.category]}`}
          >
            {categoryLabels[post.category]}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.publishedAt).toLocaleDateString("fa-IR")}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.views} بازدید
          </span>
        </div>

        {/* ==================== عنوان ==================== */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground mb-4">
          {post.title}
        </h1>

        {/* ==================== نویسنده ==================== */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shadow-glow">
            {post.author?.charAt(0) || "م"}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {post.author || "مکمل‌شاپ"}
            </p>
            <p className="text-xs text-muted-foreground">نویسنده</p>
          </div>
        </div>

        {/* ==================== محتوای مقاله ==================== */}
        <div
          className="prose dark:prose-invert max-w-none prose-img:rounded-xl prose-headings:font-bold prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ==================== برچسب‌ها ==================== */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-primary" />
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-full border border-border hover:border-primary/30 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ==================== مقالات مرتبط ==================== */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-black gold-text mb-6">مقالات مرتبط</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related._id}
                  href={`/blog/${related.slug}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-premium transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-32 overflow-hidden bg-muted/50">
                    <img
                      src={getImageSrc(related.image, related._id)}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={() => handleImageError(related._id)}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(related.publishedAt).toLocaleDateString(
                        "fa-IR",
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
