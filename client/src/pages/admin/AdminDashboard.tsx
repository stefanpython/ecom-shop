"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../api/products";
import { getOrders } from "../../api/orders";
import { getUsers } from "../../api/users";
import { getCategories } from "../../api/categories";
import api from "../../api/index";
import {
  Package,
  ShoppingBag,
  Users,
  Tag,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    categories: 0,
    revenue: 0,
    pendingOrders: 0,
  });

  // System status states
  const [systemStatus, setSystemStatus] = useState({
    server: { status: "Checking...", color: "bg-yellow-100 text-yellow-800" },
    database: { status: "Checking...", color: "bg-yellow-100 text-yellow-800" },
    api: { status: "Checking...", color: "bg-yellow-100 text-yellow-800" },
  });

  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  // Function to check system status
  const checkSystemStatus = async () => {
    setRefreshingStatus(true);

    // Reset status to checking
    setSystemStatus({
      server: { status: "Checking...", color: "bg-yellow-100 text-yellow-800" },
      database: {
        status: "Checking...",
        color: "bg-yellow-100 text-yellow-800",
      },
      api: { status: "Checking...", color: "bg-yellow-100 text-yellow-800" },
    });

    // Check server status - use the base URL without appending /api
    try {
      // Use the base URL from your API configuration
      const baseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const serverResponse = await fetch(`${baseUrl}/ping`, {
        method: "GET",
        cache: "no-cache",
      });

      setSystemStatus((prev) => ({
        ...prev,
        server: {
          status: serverResponse.ok ? "Online" : "Offline",
          color: serverResponse.ok
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800",
        },
      }));
    } catch (error) {
      console.error("Server check failed:", error);
      setSystemStatus((prev) => ({
        ...prev,
        server: { status: "Offline", color: "bg-red-100 text-red-800" },
      }));
    }

    // Check API status
    try {
      const apiResponse = await api.get("/products?limit=1");
      setSystemStatus((prev) => ({
        ...prev,
        api: {
          status: apiResponse.status === 200 ? "Operational" : "Degraded",
          color:
            apiResponse.status === 200
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800",
        },
      }));

      // If API is operational, database is likely connected
      setSystemStatus((prev) => ({
        ...prev,
        database: {
          status: "Connected",
          color: "bg-green-100 text-green-800",
        },
      }));
    } catch (error) {
      console.error("API check failed:", error);
      setSystemStatus((prev) => ({
        ...prev,
        api: { status: "Down", color: "bg-red-100 text-red-800" },
        database: { status: "Error", color: "bg-red-100 text-red-800" },
      }));
    }

    setLastChecked(new Date());
    setRefreshingStatus(false);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      let dbStatus = {
        status: "Connected",
        color: "bg-green-100 text-green-800",
      };

      try {
        const [products, orders, users, categories] = await Promise.all([
          getProducts(),
          getOrders(),
          getUsers(),
          getCategories(),
        ]);

        // Calculate revenue from completed orders
        const revenue = orders.reduce((total, order) => {
          if (order.isPaid) {
            return total + order.totalPrice;
          }
          return total;
        }, 0);

        // Count pending orders
        const pendingOrders = orders.filter(
          (order) => order.status === "Pending"
        ).length;

        setStats({
          products: products.count,
          orders: orders.length,
          users: users.length,
          categories: categories.length,
          revenue,
          pendingOrders,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        dbStatus = { status: "Error", color: "bg-red-100 text-red-800" };
      } finally {
        setLoading(false);

        // Update database status based on data fetch success
        setSystemStatus((prev) => ({
          ...prev,
          database: dbStatus,
        }));
      }
    };

    fetchDashboardData();
    checkSystemStatus();

    // Set up interval to refresh system status every 60 seconds
    const statusInterval = setInterval(checkSystemStatus, 60000);

    return () => clearInterval(statusInterval);
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    {
      title: "Total Products",
      value: stats.products,
      icon: <Package className="h-8 w-8 text-blue-600" />,
      link: "/admin/products",
      color: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: stats.orders,
      icon: <ShoppingBag className="h-8 w-8 text-green-600" />,
      link: "/admin/orders",
      color: "bg-green-50",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: <Users className="h-8 w-8 text-purple-600" />,
      link: "/admin/users",
      color: "bg-purple-50",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: <Tag className="h-8 w-8 text-yellow-600" />,
      link: "/admin/categories",
      color: "bg-yellow-50",
    },
    {
      title: "Total Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: <DollarSign className="h-8 w-8 text-emerald-600" />,
      link: "/admin/orders",
      color: "bg-emerald-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <TrendingUp className="h-8 w-8 text-red-600" />,
      link: "/admin/orders",
      color: "bg-red-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link} className="block">
            <div
              className={`${card.color} rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{card.title}</h2>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div>{card.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/admin/products/new"
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Add New Product
            </Link>
            <Link
              to="/admin/categories/new"
              className="block w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 text-center"
            >
              Add New Category
            </Link>
            <Link
              to="/admin/orders"
              className="block w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-center"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">System Status</h2>
            <button
              onClick={checkSystemStatus}
              disabled={refreshingStatus}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh Status"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshingStatus ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Server Status</span>
              <span
                className={`px-2 py-1 ${systemStatus.server.color} rounded-full text-xs`}
              >
                {systemStatus.server.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database</span>
              <span
                className={`px-2 py-1 ${systemStatus.database.color} rounded-full text-xs`}
              >
                {systemStatus.database.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>API</span>
              <span
                className={`px-2 py-1 ${systemStatus.api.color} rounded-full text-xs`}
              >
                {systemStatus.api.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
