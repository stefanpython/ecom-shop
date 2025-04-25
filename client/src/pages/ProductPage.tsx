"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import type { Product, Category, ProductsResponse } from "../types";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Get filter values from URL
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("category") || "";
  const minPrice = searchParams.get("priceMin")
    ? Number(searchParams.get("priceMin"))
    : undefined;
  const maxPrice = searchParams.get("priceMax")
    ? Number(searchParams.get("priceMax"))
    : undefined;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Form state
  const [searchTerm, setSearchTerm] = useState(keyword);
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({
    min: minPrice,
    max: maxPrice,
  });
  const [sort, setSort] = useState<{ by: string; order: "asc" | "desc" }>({
    by: sortBy,
    order: sortOrder as "asc" | "desc",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          pageNumber: currentPage,
        };

        if (keyword) params.keyword = keyword;
        if (categoryId) params.category = categoryId;
        if (minPrice !== undefined) params.priceMin = minPrice;
        if (maxPrice !== undefined) params.priceMax = maxPrice;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;

        const data: ProductsResponse = await getProducts(params);
        setProducts(data.products);
        setTotalPages(data.pages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, keyword, categoryId, minPrice, maxPrice, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ keyword: searchTerm });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    updateFilters({ category: e.target.value });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value ? Number(value) : undefined,
    }));
  };

  const handleApplyPriceFilter = () => {
    updateFilters({
      priceMin: priceRange.min,
      priceMax: priceRange.max,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [by, order] = e.target.value.split("-");
    setSort({ by, order: order as "asc" | "desc" });
    updateFilters({ sortBy: by, sortOrder: order });
  };

  const updateFilters = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams);

    // Reset to page 1 when filters change
    setCurrentPage(1);
    params.delete("pageNumber");

    // Update or remove params based on new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center btn btn-secondary w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters sidebar */}
      <div
        className={`${
          showFilters ? "block" : "hidden"
        } md:block w-full md:w-64 space-y-6 bg-white p-4 rounded-lg shadow-md`}
      >
        <div>
          <h3 className="font-semibold mb-2">Search</h3>
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
        </div>

        <div>
          <h3 className="font-semibold mb-2">Categories</h3>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Price Range</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="min"
              value={priceRange.min || ""}
              onChange={handlePriceChange}
              placeholder="Min"
              className="input"
            />
            <span>-</span>
            <input
              type="number"
              name="max"
              value={priceRange.max || ""}
              onChange={handlePriceChange}
              placeholder="Max"
              className="input"
            />
          </div>
          <button
            onClick={handleApplyPriceFilter}
            className="mt-2 btn btn-secondary w-full"
          >
            Apply
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Sort By</h3>
          <select
            value={`${sort.by}-${sort.order}`}
            onChange={handleSortChange}
            className="input"
          >
            <option value="createdAt-desc">Newest</option>
            <option value="createdAt-asc">Oldest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products grid */}
      <div className="flex-1">
        {loading ? (
          <Loader />
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded border disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 rounded ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
