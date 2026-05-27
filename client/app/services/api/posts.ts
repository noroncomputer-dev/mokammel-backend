import axiosInstance from "./axios";

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: "nutrition" | "training" | "supplements" | "lifestyle";
  tags: string[];
  author: string;
  views: number;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const postService = {
  getPublishedPosts: async (
    page: number = 1,
    limit: number = 9,
  ): Promise<{ posts: Post[]; pagination: any }> => {
    const response = await axiosInstance.get("/posts", {
      params: { page, limit },
    });
    return response.data.data;
  },

  getPostBySlug: async (slug: string): Promise<Post> => {
    // ✅ اعتبارسنجی قبل از ارسال درخواست
    if (!slug || slug.trim() === "" || slug === "undefined") {
      throw new Error(`Slug نامعتبر است: "${slug}"`);
    }
    const response = await axiosInstance.get(`/posts/${slug}`);
    return response.data.data.post;
  },

  getRelatedPosts: async (
    category: string,
    currentId: string,
  ): Promise<Post[]> => {
    // ✅ اضافه کردن اعتبارسنجی
    if (!category || !currentId) return [];
    const response = await axiosInstance.get("/posts/related", {
      params: { category, currentId },
    });
    return response.data.data.posts;
  },

  getPostsByCategory: async (
    category: string,
    page: number = 1,
  ): Promise<{ posts: Post[]; pagination: any }> => {
    const response = await axiosInstance.get(`/posts/category/${category}`, {
      params: { page },
    });
    return response.data.data;
  },

  searchPosts: async (query: string): Promise<Post[]> => {
    const response = await axiosInstance.get("/posts/search", {
      params: { q: query },
    });
    return response.data.data.posts;
  },
};

export default postService;
