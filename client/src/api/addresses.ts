import api from "./index";
import type { Address } from "../types";

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get("/addresses");
  return response.data;
};

export const getAddressById = async (id: string): Promise<Address> => {
  const response = await api.get(`/addresses/${id}`);
  return response.data;
};

export const createAddress = async (
  addressData: Partial<Address>
): Promise<Address> => {
  const response = await api.post("/addresses", addressData);
  return response.data;
};

export const updateAddress = async (
  id: string,
  addressData: Partial<Address>
): Promise<Address> => {
  const response = await api.put(`/addresses/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

export const setDefaultAddress = async (id: string): Promise<Address> => {
  const response = await api.put(`/addresses/${id}/default`);
  return response.data;
};
