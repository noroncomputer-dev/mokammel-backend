// client/src/app/services/api/compare.ts

import axiosInstance from "./axios";
import { Product } from "./products";

export interface CompareItem {
  product: Product;
  addedAt: string;
}

export interface Compare {
  _id: string;
  user: string;
  items: CompareItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CompareField {
  key: string;
  label: string;
  type: string;
}

// ✅ تایپ محصول در داده مقایسه (بدون any)
export interface CompareProductData {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  brand: {
    _id: string;
    name: string;
    logo: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
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
  images: string[];
  shortDescription: string;
}

// ✅ تایپ کامل برای پاسخ CompareData
export interface CompareData {
  fields: CompareField[];
  products: CompareProductData[];
  count: number;
}

const compareService = {
  getCompareList: async (): Promise<Compare> => {
    const response = await axiosInstance.get("/compare");
    return response.data.data.compare;
  },

  // ✅ تایپ درست شده (بدون any)
  getCompareFields: async (): Promise<CompareData> => {
    const response = await axiosInstance.get("/compare/fields");
    return response.data.data;
  },

  addToCompare: async (productId: string): Promise<Compare> => {
    const response = await axiosInstance.post("/compare", { productId });
    return response.data.data.compare;
  },

  removeFromCompare: async (productId: string): Promise<Compare> => {
    const response = await axiosInstance.delete(`/compare/${productId}`);
    return response.data.data.compare;
  },

  clearCompare: async (): Promise<void> => {
    await axiosInstance.delete("/compare");
  },
};

export default compareService;
