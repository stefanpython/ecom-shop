"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, payOrder } from "../api/orders";
import type { Order } from "../types";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handlePayOrder = async () => {
    if (!id || !order) return;

    setPaymentLoading(true);
    try {
      // Simulate payment process
      const paymentResult = {
        id: `PAY-${Date.now()}`,
        status: "COMPLETED",
        update_time: new Date().toISOString(),
        email_address: order.user.email || "customer@example.com",
      };

      await payOrder(id, paymentResult);

      // Refresh order data
      const updatedOrder = await getOrderById(id);
      setOrder(updatedOrder);

      toast.success("Payment successful");
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : "Payment failed";
      toast.error(message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
        <Link
          to="/orders"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Order Items</h2>
            </div>
            <div className="divide-y">
              {order.orderItems.map((item, index) => (
                <div key={index} className="p-4 flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.image || "/placeholder-product.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="text-sm text-gray-500">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="font-semibold text-lg">Shipping Information</h2>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span>{" "}
                {order.shippingAddress.name}
              </div>
              <div>
                <span className="font-medium">Address:</span>{" "}
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 &&
                  `, ${order.shippingAddress.addressLine2}`}
                , {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </div>
              <div>
                <span className="font-medium">Phone:</span>{" "}
                {order.shippingAddress.phone}
              </div>
              <div className="flex items-center mt-2">
                <span className="font-medium mr-2">Delivery Status:</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    order.isDelivered
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.isDelivered ? "Delivered" : "Not Delivered"}
                </span>
              </div>
              {order.isDelivered && (
                <div className="text-sm text-gray-600">
                  Delivered on{" "}
                  {new Date(order.deliveredAt!).toLocaleDateString()}
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <span className="font-medium">Tracking Number:</span>{" "}
                  {order.trackingNumber}
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="font-semibold text-lg">Payment Information</h2>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Method:</span>{" "}
                {order.paymentMethod}
              </div>
              <div className="flex items-center mt-2">
                <span className="font-medium mr-2">Payment Status:</span>
                {order.isPaid ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Paid</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span>Not Paid</span>
                  </div>
                )}
              </div>
              {order.isPaid && order.paidAt && (
                <div className="text-sm text-gray-600">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </div>
              )}
              {!order.isPaid && (
                <button
                  onClick={handlePayOrder}
                  disabled={paymentLoading}
                  className="btn btn-primary mt-4"
                >
                  {paymentLoading ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-4">
              <span>Items</span>
              <span>
                ${order.totalPrice - order.taxPrice - order.shippingPrice}
              </span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span>Shipping</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-4">
              <span>Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">Order Status:</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "Processing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Order placed on{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
