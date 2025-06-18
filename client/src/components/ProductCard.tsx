"use client";

import type React from "react";

import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product._id, 1, {
      price: product.price,
      name: product.name,
      image: product.images[0],
      discountPrice: product.discountPrice,
      discountPercentage: product.discountPercentage,
    });
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="card group border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="relative h-48 overflow-hidden border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img
          src={product.images[0] || "https://placehold.net/600x600.png"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {(product.discountPercentage ?? 0) > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 truncate">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.rating)
                    ? "fill-current"
                    : "stroke-current fill-none"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="font-bold text-gray-800">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 line-through ml-2">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-gray-800">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
