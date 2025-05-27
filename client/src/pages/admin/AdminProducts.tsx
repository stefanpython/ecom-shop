"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/products";
import { getCategories } from "../../api/categories";
import type { Product, Category, ProductParams } from "../../types";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { AxiosError } from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ProductParams = {
        pageNumber: currentPage,
        ...(searchTerm && { keyword: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
      };

      const data = await getProducts(params);
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalProducts(data.totalProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      // Load categories separately if needed
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    loadData();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((product) => product._id !== id));
        toast.success("Product deleted successfully");
      } catch (error) {
        console.error("Error:", error);
        if (error instanceof AxiosError) {
          toast.error(
            `Deletion failed: ${error.response?.data?.message || error.message}`
          );
        } else if (error instanceof Error) {
          toast.error(`Deletion failed: ${error.message}`);
        } else {
          toast.error("Failed to delete product. Check console for details.");
        }
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
        <Link
          to="/admin/products/new"
          className="btn btn-primary flex items-center justify-center sm:justify-start w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="input flex-grow"
            />
            <button
              type="submit"
              className="ml-2 p-2 bg-blue-600 text-white rounded"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="input w-full"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div>
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Stock
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No products found
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={
                                    product.images[0] ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={product.name}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {product._id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {typeof product.category === "object"
                                ? product.category.name
                                : "Unknown"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ${product.price.toFixed(2)}
                            </div>
                            {product.discountPrice && (
                              <div className="text-xs text-gray-500 line-through">
                                ${product.discountPrice.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.countInStock}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.countInStock > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.countInStock > 0
                                ? "In Stock"
                                : "Out of Stock"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/admin/products/${product._id}`}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Cards (shown on mobile) */}
          <div className="md:hidden space-y-4">
            {products.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                No products found
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      className="h-16 w-16 rounded-md object-cover"
                      src={product.images[0] || "/placeholder-product.jpg"}
                      alt={product.name}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500 mb-2">
                        {typeof product.category === "object"
                          ? product.category.name
                          : "Unknown"}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Price:</span> $
                          {product.price.toFixed(2)}
                          {product.discountPrice && (
                            <div className="text-xs line-through">
                              ${product.discountPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Stock:</span>{" "}
                          {product.countInStock}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span>
                          <span
                            className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                              product.countInStock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.countInStock > 0 ? "In Stock" : "Out"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/admin/products/${product._id}`}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-around bg-white border-t-1 border-gray-300 rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 8 + 1}-
                {Math.min(currentPage * 8, totalProducts)} of {totalProducts}{" "}
                products
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show limited page numbers with ellipsis
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === pageNum ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && <span className="px-2 py-1">...</span>}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
