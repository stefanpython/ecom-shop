"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOrderById,
  updateOrderStatus,
  updateOrderToDelivered,
} from "../../api/orders";
import type { Order } from "../../types";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const orderData = await getOrderById(id);
        setOrder(orderData);
        setSelectedStatus(orderData.status ?? "");
        setTrackingNumber(orderData.trackingNumber || "");
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !order) return;

    setUpdating(true);
    try {
      const updatedOrder = await updateOrderStatus(id, selectedStatus);
      setOrder(updatedOrder);
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!id || !order) return;

    setUpdating(true);
    try {
      const updatedOrder = await updateOrderToDelivered(id);
      setOrder(updatedOrder);
      setSelectedStatus("Delivered");
      toast.success("Order marked as delivered");
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast.error("Failed to mark order as delivered");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
        <button
          onClick={() => navigate("/admin/orders")}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Orders
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
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

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Customer Information</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name:</span>{" "}
                {typeof order.user === "object"
                  ? order.user.name
                  : "User ID: " + order.user}
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                {typeof order.user === "object"
                  ? order.user.email
                  : "Not available"}
              </div>
              <div>
                <span className="font-medium">Order Date:</span>{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="font-semibold text-lg">Shipping Information</h2>
            </div>
            <div className="space-y-2">
              {typeof order.shippingAddress === "object" ? (
                <>
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {order.shippingAddress.name}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 &&
                      `, ${order.shippingAddress.addressLine2}`}
                    , {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode},{" "}
                    {order.shippingAddress.country}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.shippingAddress.phone}
                  </div>
                </>
              ) : (
                <div>Address ID: {order.shippingAddress}</div>
              )}
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
              {order.isDelivered && order.deliveredAt && (
                <div className="text-sm text-gray-600">
                  Delivered on{" "}
                  {new Date(order.deliveredAt).toLocaleDateString()}
                </div>
              )}
              <div className="mt-4">
                <label
                  htmlFor="trackingNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="input"
                  placeholder="Enter tracking number"
                />
              </div>
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
              {order.paymentResult && (
                <div className="mt-2 text-sm">
                  <div>
                    <span className="font-medium">Transaction ID:</span>{" "}
                    {order.paymentResult.id}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    {order.paymentResult.status}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {order.paymentResult.email_address}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary and Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span>Items</span>
                <span>
                  $
                  {(
                    order.totalPrice -
                    order.taxPrice -
                    order.shippingPrice
                  ).toFixed(2)}
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
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Order Actions</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Update Order Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <Package className="h-5 w-5 mr-1" />
                {updating ? "Updating..." : "Update Status"}
              </button>

              {!order.isDelivered && (
                <button
                  onClick={handleMarkAsDelivered}
                  disabled={updating}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <Truck className="h-5 w-5 mr-1" />
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
