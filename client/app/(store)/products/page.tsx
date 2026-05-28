"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import FilterSidebar from "@/components/ui/FilterSidebar";
import productService from "@/services/api/products";
import categoryService from "@/services/api/categories";
import brandService from "@/services/api/brands";
import {
  Search,
  X,
  ChevronDown,
  Grid3X3,
  LayoutList,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  brand: { _id: string; name: string; logo?: string };
  category: { _id: string; name: string; slug: string };
  stock: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

interface Filters {
  page: number;
  limit: number;
  search: string;
  category: string;
  brand: string;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  minRating?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const SORT_OPTIONS = [
  { value: "-createdAt", label: "جدیدترین" },
  { value: "price", label: "ارزان‌ترین" },
  { value: "-price", label: "گران‌ترین" },
  { value: "-soldCount", label: "پرفروش‌ترین" },
  { value: "-rating", label: "محبوب‌ترین" },
  { value: "name", label: "الفبایی" },
];

const getImageUrl = (product: any): string => {
  if (product.images && Array.isArray(product.images) && product.images[0]) {
    const img = product.images[0];
    if (img.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${img}`;
    }
    return img;
  }
  return "/placeholder-image.jpg";
};

const SkeletonCard = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-pulse">
    <div className="aspect-square bg-muted/50" />
    <div className="p-4 space-y-3">
      <div className="h-2.5 bg-muted/60 rounded-full w-16" />
      <div className="h-4 bg-muted/60 rounded-full w-5/6" />
      <div className="h-4 bg-muted/60 rounded-full w-3/5" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-muted/60 rounded-full w-24" />
        <div className="h-9 bg-muted/60 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getPages = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10" dir="rtl">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-all shadow-sm"
      >
        <ChevronRight className="h-4 w-4" /> قبلی
      </button>

      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
            currentPage === page
              ? "bg-primary text-primary-foreground shadow-glow scale-105"
              : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-all shadow-sm"
      >
        بعدی <ChevronLeft className="h-4 w-4" />
      </button>
    </div>
  );
};

const FilterTag = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/30">
    {label}
    <button
      onClick={onRemove}
      className="hover:text-rose-500 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [priceRange] = useState({ min: 0, max: 10000000 });
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const searchRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 12,
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    sort: searchParams.get("sort") || "-createdAt",
    minRating: searchParams.get("rating")
      ? Number(searchParams.get("rating"))
      : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    hasDiscount: searchParams.get("discount") === "true" ? true : undefined,
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          categoryService.getCategories(),
          brandService.getBrands(),
        ]);
        setCategories(categoriesRes.categories || categoriesRes.data || []);
        setBrands(brandsRes.brands || brandsRes.data || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters);

      let productsList: Product[] = [];
      let paginationData: Pagination = pagination;

      if (response.data?.products) {
        productsList = response.data.products;
        paginationData = response.data.pagination;
      } else if (response.products) {
        productsList = response.products;
        paginationData = response.pagination;
      } else if (Array.isArray(response)) {
        productsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        productsList = response.data;
      }

      setProducts(productsList);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.sort && filters.sort !== "-createdAt")
      params.set("sort", filters.sort);
    if (filters.minRating) params.set("rating", filters.minRating.toString());
    if (filters.inStock !== undefined)
      params.set("inStock", filters.inStock.toString());
    if (filters.hasDiscount !== undefined)
      params.set("discount", filters.hasDiscount.toString());
    if (filters.page > 1) params.set("page", filters.page.toString());

    router.push(
      `/products${params.toString() ? `?${params.toString()}` : ""}`,
      {
        scroll: false,
      },
    );
  }, [filters, router]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      page: 1,
      limit: 12,
      search: "",
      category: "",
      brand: "",
      minPrice: undefined,
      maxPrice: undefined,
      sort: "-createdAt",
      minRating: undefined,
      inStock: undefined,
      hasDiscount: undefined,
    });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.inStock ||
    filters.hasDiscount
  );

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.brand,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    filters.inStock,
    filters.hasDiscount,
  ].filter(Boolean).length;

  const getFilterLabel = () => {
    if (filters.search) return `جستجو: ${filters.search}`;
    if (filters.category) {
      const cat = categories.find(
        (c) => c._id === filters.category || c.slug === filters.category,
      );
      return `دسته: ${cat?.name || filters.category}`;
    }
    if (filters.brand) {
      const br = brands.find(
        (b) => b._id === filters.brand || b.slug === filters.brand,
      );
      return `برند: ${br?.name || filters.brand}`;
    }
    if (filters.minPrice || filters.maxPrice)
      return `قیمت: ${filters.minPrice?.toLocaleString()} - ${filters.maxPrice?.toLocaleString()} تومان`;
    if (filters.minRating) return `امتیاز: ${filters.minRating} ستاره به بالا`;
    if (filters.inStock) return "موجود در انبار";
    if (filters.hasDiscount) return "تخفیف دار";
    return "";
  };

  return (
    <div className="min-h-screen bg-background transition-colors" dir="rtl">
      {/* ==================== هدر صفحه (بنر طلایی) ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,160,17,0.06),transparent_50%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFilterChange("search", searchInput);
              }}
              className="w-full md:w-[400px]"
            >
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  ref={searchRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="جستجو در محصولات..."
                  className="w-full h-12 py-3 pr-12 pl-12 rounded-2xl bg-muted/30 border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      handleFilterChange("search", "");
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-muted-foreground text-xs mt-2 pr-1">
                Enter بزنید تا جستجو شود
              </p>
            </form>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-3">
                <Link href="/" className="hover:text-primary transition">
                  خانه
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-semibold">محصولات</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
                همه محصولات
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-primary/5 rounded-xl px-3 py-1.5 border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground text-xs font-medium">
                    {loading
                      ? "در حال بارگذاری..."
                      : `${pagination.total.toLocaleString("fa-IR")} محصول موجود`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== بدنه صفحه ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">
          <FilterSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            categories={categories}
            brands={brands}
            filters={filters}
            priceRange={priceRange}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />

          <div className="flex-1 min-w-0">
            {/* نوار ابزار بالا */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`lg:hidden flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-semibold shadow-sm transition-all ${
                    activeFilterCount > 0
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  فیلترها
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-primary-foreground text-primary text-xs rounded-full flex items-center justify-center font-black">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <FilterTag label={getFilterLabel()} onRemove={clearFilters} />
                )}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-all border border-rose-200 dark:border-rose-900/40"
                  >
                    <X className="w-3.5 h-3.5" /> حذف همه
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!loading && (
                  <span className="hidden md:block text-sm text-muted-foreground">
                    <span className="text-foreground font-bold">
                      {pagination.total.toLocaleString("fa-IR")}
                    </span>{" "}
                    محصول
                  </span>
                )}
                <div className="w-px h-5 bg-border hidden md:block" />

                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="appearance-none h-10 pr-4 pl-9 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-semibold shadow-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="hidden sm:flex items-center bg-card border border-border rounded-xl p-1 shadow-sm gap-0.5">
                  <button
                    onClick={() => setGridCols(3)}
                    className={`p-2 rounded-lg transition-all ${
                      gridCols === 3
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridCols(2)}
                    className={`p-2 rounded-lg transition-all ${
                      gridCols === 2
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

            {/* نمایش محصولات */}
            {loading ? (
              <div
                className={`grid gap-4 ${gridCols === 3 ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-muted/30 rounded-3xl flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">
                  محصولی یافت نشد
                </h3>
                <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed">
                  {hasActiveFilters
                    ? "با فیلترهای انتخابی نتیجه‌ای پیدا نشد. فیلترها را تغییر دهید."
                    : "هیچ محصولی در این بخش وجود ندارد."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 btn-gold rounded-2xl font-bold text-sm"
                  >
                    حذف همه فیلترها
                  </button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-4 ${gridCols === 3 ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}
                >
                  {products.map((product) => {
                    const productForCard = {
                      id: product._id,
                      slug: product.slug,
                      name: product.name,
                      brand:
                        typeof product.brand === "object"
                          ? product.brand.name
                          : "بدون برند",
                      price: product.price,
                      oldPrice: product.discountPrice,
                      image: getImageUrl(product),
                      discount: product.discountPrice
                        ? Math.round(
                            ((product.price - product.discountPrice) /
                              product.price) *
                              100,
                          )
                        : 0,
                      rating: product.rating || 0,
                      reviews: product.reviewCount || 0,
                      stock: product.stock || 0,
                    };
                    return (
                      <ProductCard key={product._id} product={productForCard} />
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    نمایش{" "}
                    <span className="text-foreground font-bold">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    تا{" "}
                    <span className="text-foreground font-bold">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total,
                      )}
                    </span>{" "}
                    از{" "}
                    <span className="text-foreground font-bold">
                      {pagination.total.toLocaleString("fa-IR")}
                    </span>{" "}
                    محصول
                  </p>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={(page) =>
                      setFilters((prev) => ({ ...prev, page }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-border border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">در حال بارگذاری محصولات...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
