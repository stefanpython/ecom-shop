import api from "./index";
import type { Order } from "../types";

export const createOrder = async (orderData: Order): Promise<Order> => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get("/orders/myorders");
  return response.data;
};

export const payOrder = async (
  orderId: string,
  paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  }
): Promise<Order> => {
  const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
  return response.data;
};
