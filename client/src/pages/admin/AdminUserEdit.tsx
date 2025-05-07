"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../../api/users";
import type { User } from "../../types";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";

const AdminUserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    isAdmin: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const userData = await getUserById(id);
        setFormData({
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await updateUser(id, formData);
      toast.success("User updated successfully");
      navigate("/admin/users");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <button
          onClick={() => navigate("/admin/users")}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Users
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={formData.isAdmin}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isAdmin"
              className="ml-2 block text-sm text-gray-900"
            >
              Admin User
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="btn btn-secondary mr-2"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center"
            disabled={submitting}
          >
            <Save className="h-5 w-5 mr-1" />
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserEdit;
