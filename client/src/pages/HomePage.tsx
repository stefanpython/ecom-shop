"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFeaturedProducts, getTopProducts } from "../api/products";
import { getCategories } from "../api/categories";
import type { Product, Category } from "../types";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredData, topData, categoriesData] = await Promise.all([
          getFeaturedProducts(4),
          getTopProducts(),
          getCategories(),
        ]);
        setFeaturedProducts(featuredData);
        setTopProducts(topData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching home page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white rounded-lg p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to ShopApp
          </h1>
          <p className="text-lg mb-6">
            Discover amazing products at unbeatable prices
          </p>
          <Link
            to="/products"
            className="btn bg-white text-blue-600 hover:bg-gray-100"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="bg-gray-100 rounded-lg p-4 text-center hover:bg-gray-200 transition-colors"
            >
              {category.image && (
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-16 h-16 mx-auto mb-2 object-contain"
                />
              )}
              <h3 className="font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Top Rated Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topProducts.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
