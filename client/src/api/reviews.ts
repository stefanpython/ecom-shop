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
