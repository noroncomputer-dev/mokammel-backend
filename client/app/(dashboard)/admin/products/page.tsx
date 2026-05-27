"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import api from "../../../services/api/axios";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { name: string; slug: string };
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // ✅ فقط پارامترهای معتبر را ارسال کن
      const params: any = { page, limit };

      // فقط اگر search مقدار معتبر دارد، اضافه کن
      if (search && search.trim() && search !== "") {
        params.search = search.trim();
      }

      const res = await api.get("/products", { params });

      let productsList: Product[] = [];
      let pagination = { pages: 1 };

      if (res.data?.data?.products && Array.isArray(res.data.data.products)) {
        productsList = res.data.data.products;
        pagination = res.data.data.pagination || { pages: 1 };
      } else if (res.data?.products && Array.isArray(res.data.products)) {
        productsList = res.data.products;
        pagination = res.data.pagination || { pages: 1 };
      } else if (Array.isArray(res.data)) {
        productsList = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        productsList = res.data.data;
      }

      setProducts(productsList);
      setTotalPages(pagination.pages || 1);
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.error("Bad request - check parameters:", {
          search,
          page,
          limit,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      setDeleteId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1); // صفحه اول برو
  };

  const getStatusBadge = (isActive: boolean, stock: number) => {
    if (!isActive)
      return (
        <span className="badge-gold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
          غیرفعال
        </span>
      );
    if (stock === 0)
      return (
        <span className="badge-gold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
          ناموجود
        </span>
      );
    if (stock < 5)
      return (
        <span className="badge-gold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
          موجودی کم
        </span>
      );
    return (
      <span className="badge-gold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
        موجود
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ==================== هدر طلایی ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary/80 dark:text-primary/70 uppercase tracking-wider">
              پنل مدیریت
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold gold-text">
            مدیریت محصولات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت و ویرایش محصولات فروشگاه
          </p>
        </div>
        <Link href="/admin/products/new">
          <button className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold shadow-md">
            <Plus className="h-4 w-4" />
            محصول جدید
          </button>
        </Link>
      </div>

      {/* ==================== جستجو ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجوی محصول..."
              value={search}
              onChange={handleSearch}
              className="input-luxury w-full pr-10 pl-4 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ==================== جدول محصولات ==================== */}
      <div className="card-luxury overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-2 border-border border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">محصولی یافت نشد</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    تصویر
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    نام محصول
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    دسته‌بندی
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    قیمت
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    موجودی
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ویژه
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="text-right py-3.5 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {products.map((product, index) => (
                  <tr
                    key={product._id}
                    className="group hover:bg-muted/30 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/50 border border-border/50">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            بدون
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-foreground line-clamp-1">
                        {product.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {product.category?.name || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold gold-text">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {product.stock} عدد
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {product.isFeatured ? (
                        <span className="badge-gold bg-primary/10 text-primary border-primary/30">
                          <Sparkles className="w-3 h-3 inline ml-1" />
                          ویژه
                        </span>
                      ) : (
                        <span className="badge-gold bg-muted text-muted-foreground border-border">
                          عادی
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(product.isActive, product.stock)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/product/${product.slug}`} target="_blank">
                          <button
                            className="p-2 rounded-lg hover:bg-muted/80 transition-all duration-200 group/btn"
                            title="مشاهده در سایت"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                          </button>
                        </Link>
                        <Link href={`/admin/products/${product._id}`}>
                          <button
                            className="p-2 rounded-lg hover:bg-muted/80 transition-all duration-200 group/btn"
                            title="ویرایش"
                          >
                            <Pencil className="h-4 w-4 text-primary/70 group-hover/btn:text-primary transition-colors" />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteId(product._id)}
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 group/btn"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500/70 group-hover/btn:text-rose-500 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ==================== صفحه‌بندی ==================== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 p-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              صفحه <span className="text-primary font-medium">{page}</span> از{" "}
              {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== دیالوگ حذف ==================== */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card-luxury max-w-md w-full p-6 shadow-2xl animate-fadeUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">حذف محصول</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              آیا از حذف این محصول اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-gold-outline px-5 py-2 text-sm font-medium"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {deleting ? "در حال حذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
