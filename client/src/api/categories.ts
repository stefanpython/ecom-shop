import api from "./index";
import type { Category } from "../types";

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");
  return response.data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (
  categoryData: Partial<Category>
): Promise<Category> => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

export const updateCategory = async (
  id: string,
  categoryData: Partial<Category>
): Promise<Category> => {
  const response = await api.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
