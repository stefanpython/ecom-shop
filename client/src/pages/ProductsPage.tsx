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

type ProductQueryParams = {
  pageNumber: number;
  keyword?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: "desc" | "asc";
};

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
        const params: ProductQueryParams = {
          pageNumber: currentPage,
        };

        if (keyword) params.keyword = keyword;
        if (categoryId) params.category = categoryId;
        if (minPrice !== undefined) params.priceMin = minPrice;
        if (maxPrice !== undefined) params.priceMax = maxPrice;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder && (sortOrder === "desc" || sortOrder === "asc")) {
          params.sortOrder = sortOrder;
        }

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

  const updateFilters = (newFilters: {
    keyword?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: undefined, max: undefined });
    setSort({ by: "createdAt", order: "desc" });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Mobile filter toggle */}
        <div className="col-12 d-md-none mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
          >
            <Filter className="me-2" size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filters sidebar */}
        <div
          className={`col-md-3 ${
            showFilters ? "d-block" : "d-none"
          } d-md-block`}
        >
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Filters</h5>
                <button
                  onClick={clearFilters}
                  className="btn btn-sm btn-outline-secondary"
                >
                  Clear all
                </button>
              </div>

              {/* Search Form - Enhanced */}
              <div className="mb-4">
                <form onSubmit={handleSearch}>
                  <div className="input-group">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search products..."
                      className="form-control border-end-0"
                      style={{
                        borderRight: "none",
                        boxShadow: "none",
                        height: "45px",
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary d-flex align-items-center justify-content-center"
                      style={{
                        width: "45px",
                        height: "45px",
                      }}
                    >
                      <Search size={18} />
                    </button>
                  </div>
                  {searchTerm && (
                    <div className="mt-2">
                      <small className="text-muted">
                        Press enter to search or{" "}
                        <a
                          href="#"
                          onClick={() => {
                            setSearchTerm("");
                            updateFilters({ keyword: "" });
                          }}
                          className="text-primary"
                        >
                          clear
                        </a>
                      </small>
                    </div>
                  )}
                </form>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Categories</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="form-select"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Price Range</label>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min || ""}
                    onChange={handlePriceChange}
                    placeholder="Min"
                    className="form-control"
                    min="0"
                  />
                  <span className="text-muted">to</span>
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max || ""}
                    onChange={handlePriceChange}
                    placeholder="Max"
                    className="form-control"
                    min="0"
                  />
                </div>
                <button
                  onClick={handleApplyPriceFilter}
                  className="btn btn-outline-primary w-100"
                >
                  Apply Price Filter
                </button>
              </div>

              <div>
                <label className="form-label fw-semibold">Sort By</label>
                <select
                  value={`${sort.by}-${sort.order}`}
                  onChange={handleSortChange}
                  className="form-select"
                >
                  <option value="createdAt-desc">Newest</option>
                  <option value="createdAt-asc">Oldest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="col-md-9">
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <div className="card shadow-sm">
                <div className="card-body py-5">
                  <h4 className="text-muted mb-3">No products found</h4>
                  <p className="text-muted mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {products.map((product) => (
                  <div key={product._id} className="col">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="page-link"
                        aria-label="Previous"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          onClick={() => handlePageChange(i + 1)}
                          className="page-link"
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="page-link"
                        aria-label="Next"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
