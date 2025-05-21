"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPaymentById, updatePaymentStatus } from "../../api/payments";
import { getOrderById } from "../../api/orders";
import type { Payment, Order } from "../../types";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

const AdminPaymentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const paymentData = await getPaymentById(id);
        setPayment(paymentData);
        setSelectedStatus(paymentData.status);

        // Fetch associated order if available
        if (paymentData.order) {
          const orderId =
            typeof paymentData.order === "object"
              ? paymentData.order._id
              : paymentData.order;
          try {
            const orderData = await getOrderById(orderId);
            setOrder(orderData);
          } catch (error) {
            console.error("Error fetching order details:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !payment) return;

    setUpdating(true);
    try {
      const updatedPayment = await updatePaymentStatus(
        id,
        selectedStatus,
        payment.transactionId
      );
      setPayment(updatedPayment);
      toast.success("Payment status updated successfully");
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;
  if (!payment)
    return <div className="text-center py-8">Payment not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Details</h1>
        <button
          onClick={() => navigate("/admin/payments")}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Payments
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="font-semibold text-lg">Payment Information</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Transaction ID
                  </span>
                  <span className="block mt-1">
                    {payment.transactionId || "Not available"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Payment Method
                  </span>
                  <span className="block mt-1">{payment.paymentMethod}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Amount
                  </span>
                  <span className="block mt-1 text-lg font-semibold">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <span
                    className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "Failed"
                        ? "bg-red-100 text-red-800"
                        : payment.status === "Refunded"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Date
                  </span>
                  <span className="block mt-1">
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Customer
                  </span>
                  <span className="block mt-1">
                    {typeof payment.user === "object"
                      ? payment.user.name
                      : `User ID: ${payment.user}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {payment.paymentDetails && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Payment Details</h2>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(payment.paymentDetails, null, 2)}
              </pre>
            </div>
          )}

          {/* Associated Order */}
          {order && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="font-semibold text-lg">Associated Order</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">
                      Order ID
                    </span>
                    <span className="block mt-1">#{order._id.slice(-8)}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">
                      Order Status
                    </span>
                    <span
                      className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-gray-500">
                      Total Amount
                    </span>
                    <span className="block mt-1 text-lg font-semibold">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-500">
                      Payment Status
                    </span>
                    <div className="flex items-center mt-1">
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
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Order Date
                  </span>
                  <span className="block mt-1">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Order Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Update Payment Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="font-semibold text-lg mb-4">Update Payment Status</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Payment Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input w-full"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === payment.status}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-1" />
              {updating ? "Updating..." : "Update Status"}
            </button>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                <strong>Note:</strong> Changing the payment status to
                "Completed" will automatically mark the associated order as paid
                if it isn't already.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentDetail;
