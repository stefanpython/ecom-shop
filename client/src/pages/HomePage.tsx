"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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

  // Settings for the featured products carousel
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true,
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 md:p-12 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-transparent to-black/10"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Welcome to <span className="text-yellow-300">ShopApp</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl mb-8"
          >
            Discover amazing products at unbeatable prices
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Products Carousel */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Featured Products
          </h2>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-all"
          >
            View All &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Slider {...sliderSettings}>
            {featuredProducts.map((product) => (
              <div key={product._id} className="px-2">
                <div className="bg-gray-50 rounded-lg p-6 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-1/2">
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-contain rounded-lg"
                    />
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </span>
                      {product.oldPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          ${product.oldPrice}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${product._id}`}
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </motion.section>

      {/* Categories */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category) => (
            <motion.div
              key={category._id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to={`/products?category=${category._id}`}
                className="block bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                {category.image && (
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center p-2">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-lg text-gray-800">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {category.productCount} products
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Top Rated Products */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Top Rated Products
          </h2>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-all"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProducts.slice(0, 4).map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Newsletter CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 md:p-12 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest products and exclusive
            offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="px-6 py-3 bg-yellow-400 text-blue-800 font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
