import api from "./index";
import type { Review } from "../types";

export const getReviews = async (productId?: string): Promise<Review[]> => {
  const params = productId ? { product: productId } : {};
  const response = await api.get("/reviews", { params });
  return response.data;
};

export const createReview = async (reviewData: {
  product: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<Review> => {
  const response = await api.post("/reviews", reviewData);
  return response.data;
};

export const updateReview = async (
  id: string,
  reviewData: Partial<Review>
): Promise<Review> => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};

export const getReviewById = async (id: string): Promise<Review> => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

export const approveReview = async (id: string): Promise<Review> => {
  const response = await api.put(`/reviews/${id}/approve`);
  return response.data;
};
