import api from "./index";
import type { LoginCredentials, RegisterData, User } from "../types";

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post("/users/login", credentials);
  return response.data;
};

export const register = async (userData: RegisterData): Promise<User> => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};
