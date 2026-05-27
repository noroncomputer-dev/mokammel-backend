"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import api from "@/services/api/axios";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  brand: { name: string };
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/wishlist");
      if (response.data.success) {
        setItems(response.data.data.products);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    setRemovingId(productId);
    try {
      const response = await api.delete(`/users/wishlist/${productId}`);
      if (response.data.success) {
        toast.success("محصول از علاقه‌مندی‌ها حذف شد");
        setItems(items.filter((item) => item._id !== productId));
      }
    } catch (error) {
      toast.error("خطا در حذف محصول");
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = (product: WishlistItem) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(
      (item: any) => item.productId === product._id,
    );
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        quantity: 1,
        image: product.images?.[0],
        slug: product.slug,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("محصول به سبد خرید اضافه شد");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          علاقه‌مندی‌ها
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          محصولات مورد علاقه شما
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            هیچ محصولی در لیست علاقه‌مندی‌ها وجود ندارد
          </p>
          <Link
            href="/products"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <Link href={`/product/${item.slug}`}>
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={item.images?.[0] || "/placeholder-image.jpg"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              </Link>
              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.brand?.name}
                </p>
                <Link href={`/product/${item.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {item.discountPrice ? (
                      <>
                        <span className="text-sm font-bold text-red-600">
                          {formatPrice(item.discountPrice)}
                        </span>
                        <span className="text-xs text-gray-400 line-through mr-1">
                          {formatPrice(item.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="افزودن به سبد خرید"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      disabled={removingId === item._id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      {removingId === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
