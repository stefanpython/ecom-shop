"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCategoryById,
  createCategory,
  updateCategory,
  getCategories,
} from "../../api/categories";
import type { Category } from "../../types";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";

const AdminCategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Category form state
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    image: "",
    parent: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allCategories = await getCategories();
        // Filter out the current category (for edit mode) to prevent self-parent
        setCategories(
          isEditMode
            ? allCategories.filter((cat) => cat._id !== id)
            : allCategories
        );

        if (isEditMode && id) {
          const categoryData = await getCategoryById(id);
          setFormData({
            ...categoryData,
            parent:
              typeof categoryData.parent === "object"
                ? categoryData.parent._id
                : categoryData.parent || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditMode && id) {
        await updateCategory(id, formData);
        toast.success("Category updated successfully");
      } else {
        await createCategory(formData);
        toast.success("Category created successfully");
      }
      navigate("/admin/categories");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save category";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Category" : "Add New Category"}
        </h1>
        <button
          onClick={() => navigate("/admin/categories")}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Categories
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category Name*
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
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="parent"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Parent Category
              </label>
              <select
                id="parent"
                name="parent"
                value={formData.parent as string}
                onChange={handleChange}
                className="input"
              >
                <option value="">None (Top Level Category)</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URL
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Preview
                </label>
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Category preview"
                  className="h-32 w-32 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Active Category
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/categories")}
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
            {submitting ? "Saving..." : "Save Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCategoryEdit;
