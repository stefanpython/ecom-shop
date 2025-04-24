import api from "./index";
import type { Product, ProductsResponse } from "../types";

interface ProductParams {
  keyword?: string;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageNumber?: number;
}

export const getProducts = async (
  params: ProductParams = {}
): Promise<ProductsResponse> => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getTopProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products/top");
  return response.data;
};

export const getFeaturedProducts = async (count = 8): Promise<Product[]> => {
  const response = await api.get("/products/featured", { params: { count } });
  return response.data;
};

export const createProductReview = async (
  productId: string,
  review: { rating: number; title: string; comment: string }
): Promise<{ message: string }> => {
  const response = await api.post(`/products/${productId}/reviews`, review);
  return response.data;
};
