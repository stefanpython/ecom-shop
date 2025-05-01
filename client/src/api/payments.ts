import api from "./index";
import type { Payment } from "../types";

export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get("/payments");
  return response.data;
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

export const createPayment = async (paymentData: {
  order: string;
  paymentMethod: string;
  amount: number;
  currency?: string;
  status: string;
  transactionId?: string;
  paymentDetails?: any;
}): Promise<Payment> => {
  const response = await api.post("/payments", paymentData);
  return response.data;
};

export const updatePaymentStatus = async (
  id: string,
  status: string,
  transactionId?: string
): Promise<Payment> => {
  const response = await api.put(`/payments/${id}`, { status, transactionId });
  return response.data;
};

export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await api.get("/payments/admin");
  return response.data;
};
