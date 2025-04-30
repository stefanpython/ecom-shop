"use client";

import type React from "react";

import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext"
import { getUserProfile, updateUserProfile } from "../api/auth";
import { getAddresses } from "../api/addresses";
import { getMyOrders } from "../api/orders";
import type { Address, Order } from "../types";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { User, Package, MapPin } from "lucide-react";

const ProfilePage = () => {
  //   const { user } = useAuth()
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [profileData, addressesData, ordersData] = await Promise.all([
          getUserProfile(),
          getAddresses(),
          getMyOrders(),
        ]);

        // Set profile data
        setName(profileData.name);
        setEmail(profileData.email);
        setPhone(profileData.phone || "");

        // Set addresses and orders
        setAddresses(addressesData);
        setRecentOrders(ordersData.slice(0, 3)); // Get only 3 most recent orders
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name,
        email,
        phone,
        ...(password ? { password } : {}),
      };

      await updateUserProfile(userData);
      toast.success("Profile updated successfully");

      // Clear password fields after successful update
      setPassword("");
      setConfirmPassword("");
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Profile Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <Link
                to="/orders"
                className="text-blue-600 hover:underline text-sm"
              >
                View All Orders
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  You haven't placed any orders yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          Order #{order._id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Placed on{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Total:</span> $
                      {order.totalPrice.toFixed(2)}
                    </div>
                    <div className="mt-2">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Order Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
            </div>
            <Link
              to="/checkout"
              className="text-blue-600 hover:underline text-sm"
            >
              Add New
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">
                You don't have any saved addresses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address._id} className="border rounded-lg p-4">
                  {address.isDefault && (
                    <div className="text-xs font-medium text-blue-600 mb-1">
                      Default Address
                    </div>
                  )}
                  <div className="font-medium">{address.name}</div>
                  <div className="text-sm text-gray-600">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                    <br />
                    Phone: {address.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
