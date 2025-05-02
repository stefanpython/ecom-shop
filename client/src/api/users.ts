import api from "./index";
import type { User } from "../types";

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
