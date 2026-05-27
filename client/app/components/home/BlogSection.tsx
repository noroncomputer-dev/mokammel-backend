"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Eye, Clock } from "lucide-react";
import api from "@/services/api/axios";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  category: string;
  views: number;
  publishedAt: string;
}

const categoryLabels: Record<string, string> = {
  nutrition: "تغذیه",
  training: "تمرین",
  supplements: "مکمل",
  lifestyle: "سبک زندگی",
};

export default function BlogSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get("/posts");
      if (response.data.success) {
        setPosts(response.data.data.posts.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || posts.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900/50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            مقالات آموزشی
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            جدیدترین مطالب تغذیه و تمرین
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image || "/blog-placeholder.jpg"}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {categoryLabels[post.category]}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.views} بازدید
                  </span>
                  <span className="text-sm text-primary group-hover:translate-x-1 transition">
                    ادامه مطلب ←
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-blue-700 font-medium"
          >
            مشاهده همه مقالات
            <span>←</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
