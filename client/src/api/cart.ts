import api from "./index";
import type { Cart } from "../types";

export const getCart = async (): Promise<Cart> => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCart = async (
  productId: string,
  quantity = 1,
  attributes = {}
): Promise<Cart> => {
  const response = await api.post("/cart", { productId, quantity, attributes });
  return response.data;
};

export const updateCartItem = async (
  itemId: string,
  quantity: number,
  attributes = {}
): Promise<Cart> => {
  const response = await api.put(`/cart/${itemId}`, { quantity, attributes });
  return response.data;
};

export const removeCartItem = async (itemId: string): Promise<Cart> => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCart = async (): Promise<{ message: string }> => {
  const response = await api.delete("/cart");
  return response.data;
};
