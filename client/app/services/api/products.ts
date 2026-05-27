// client/src/services/api/products.ts
import axiosInstance from "./axios";

// ==================== تایپ‌ها ====================
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: { _id: string; name: string; slug: string };
  brand: { _id: string; name: string; logo?: string } | null;
  stock: number;
  rating: number;
  reviewCount: number;
  flavors: string[];
  weights: string[];
  nutritionFacts: {
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    extra?: { label: string; value: string }[];
  };
  isActive: boolean;
  isFeatured: boolean;
  specifications: {
    weight: string;
    servingSize: string;
    servingsPerContainer: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    sodium: number;
    caffeine: number;
    creatine: number;
    betaAlanine: number;
    bcaa: number;
    glutamine: number;
  };
  ingredients: string[];
  howToUse: string;
  warnings: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: string;
  featured?: boolean;
  isActive?: boolean;
  hasDiscount?: boolean;
  inStock?: boolean;
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ProductResponse {
  product: Product;
}

interface ProductsListResponse {
  products: Product[];
  pagination: ProductsResponse["pagination"];
}

interface AdvancedSearchParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ==================== تابع کمکی برای ساخت Query String ====================
const buildQueryString = (filters: ProductFilters): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "null" &&
      value !== "undefined"
    ) {
      params.append(key, value.toString());
    }
  });

  return params.toString();
};

// ==================== سرویس محصولات ====================
const productService = {
  // دریافت لیست محصولات با فیلتر
  getProducts: async (
    filters: ProductFilters = {},
  ): Promise<ProductsResponse> => {
    const queryString = buildQueryString(filters);
    const url = queryString ? `/products?${queryString}` : "/products";
    const response =
      await axiosInstance.get<ApiResponse<ProductsListResponse>>(url);
    return response.data.data;
  },

  // دریافت محصول با اسلاگ
  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await axiosInstance.get<ApiResponse<ProductResponse>>(
      `/products/${slug}`,
    );
    return response.data.data.product;
  },

  // دریافت محصول با ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<ApiResponse<ProductResponse>>(
      `/products/id/${id}`,
    );
    return response.data.data.product;
  },

  // دریافت محصولات ویژه
  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ products: Product[] }>
    >(`/products/featured?limit=${limit}`);
    return response.data.data.products;
  },

  // دریافت محصولات پرفروش
  getBestSellerProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ products: Product[] }>
    >(`/products/best-sellers?limit=${limit}`);
    return response.data.data.products;
  },

  // دریافت محصولات تخفیف دار
  getOnSaleProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ products: Product[] }>
    >(`/products/on-sale?limit=${limit}`);
    return response.data.data.products;
  },

  // دریافت محدوده قیمت
  getPriceRange: async (): Promise<PriceRange> => {
    try {
      const response = await axiosInstance.get<ApiResponse<PriceRange>>(
        "/products/price-range",
      );
      if (response.data?.data) {
        return {
          minPrice: response.data.data.minPrice,
          maxPrice: response.data.data.maxPrice,
        };
      }
    } catch (error) {
      console.log(
        "Price range API not available, calculating from products...",
      );
    }

    // Fallback: از بین محصولات محاسبه کن
    const allProducts = await productService.getProducts({ limit: 100 });
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    if (allProducts.products && allProducts.products.length > 0) {
      allProducts.products.forEach((product) => {
        if (product.price < minPrice) minPrice = product.price;
        if (product.price > maxPrice) maxPrice = product.price;
      });
    }

    return {
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxPrice: maxPrice === -Infinity ? 10000000 : maxPrice,
    };
  },

  // ایجاد محصول جدید (ادمین)
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>(
      "/products",
      data,
    );
    return response.data.data.product;
  },

  // بروزرسانی محصول (ادمین)
  updateProduct: async (
    id: string,
    data: Partial<Product>,
  ): Promise<Product> => {
    const response = await axiosInstance.put<ApiResponse<ProductResponse>>(
      `/products/${id}`,
      data,
    );
    return response.data.data.product;
  },

  // حذف نرم محصول (ادمین)
  deleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
  },

  // حذف فیزیکی محصول (ادمین)
  permanentDeleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/products/${id}/permanent`);
  },

  // جستجوی پیشرفته
  advancedSearch: async (
    searchParams: AdvancedSearchParams,
  ): Promise<ProductsResponse> => {
    const response = await axiosInstance.post<
      ApiResponse<ProductsListResponse>
    >("/products/search", searchParams);
    return response.data.data;
  },

  // بروزرسانی موجودی محصول
  updateStock: async (
    id: string,
    stock: number,
  ): Promise<{ stock: number; inStock: boolean }> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ stock: number; inStock: boolean }>
    >(`/products/${id}/stock`, { stock });
    return response.data.data;
  },
};

export default productService;
