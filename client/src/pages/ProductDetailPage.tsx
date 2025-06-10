"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api/products";
import { getReviews, createReview } from "../api/reviews";
import type { Product, Review } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import Rating from "../components/Rating";
import toast from "react-hot-toast";
import { Star, ShoppingCart, ChevronRight } from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Review form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [productData, reviewsData] = await Promise.all([
          getProductById(id),
          getReviews(id),
        ]);

        setProduct(productData);
        setReviews(reviewsData);
        setSelectedImage(productData.images[0] || "");
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product._id, quantity);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("You must be logged in to submit a review");
      return;
    }

    if (!id) return;

    setReviewSubmitting(true);
    try {
      // 1. Submit the new review
      await createReview({
        product: id,
        rating,
        title,
        comment,
      });

      // 2. Calculate the new average rating
      const newReview: Review = {
        _id: "temp-id", // Temporary ID (will be replaced when fetched)
        rating,
        title,
        comment,
        user: { name: "You" }, // Placeholder
        createdAt: new Date().toISOString(),
        isApproved: false,
        product: id,
      };

      // 3. Update reviews list IMMEDIATELY (optimistic UI)
      const updatedReviews = [...reviews, newReview];
      setReviews(updatedReviews);

      // 4. Update product rating IMMEDIATELY
      const newRating =
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
        updatedReviews.length;

      if (product) {
        setProduct({
          ...product,
          rating: newRating,
          numReviews: updatedReviews.length,
        });
      }

      // 5. Reset form
      setRating(5);
      setTitle("");
      setComment("");
      setShowReviewForm(false);

      toast.success("Review submitted successfully");

      // 6. (Optional) Refetch reviews to get the actual data from the server
      const serverReviews = await getReviews(id);
      setReviews(serverReviews);

      // Update product rating again with server data
      if (serverReviews.length > 0 && product) {
        const serverRating =
          serverReviews.reduce((sum, review) => sum + review.rating, 0) /
          serverReviews.length;

        setProduct({
          ...product,
          rating: serverRating,
          numReviews: serverReviews.length,
        });
      }
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error submitting review:", error);
      toast.error(err.response?.data?.message || "Failed to submit review");

      // Rollback optimistic updates on error
      setReviews(reviews);
      setProduct(product);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!product)
    return <div className="text-center py-8">Product not found</div>;

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-blue-600">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to="/products" className="hover:text-blue-600">
          Products
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="truncate">{product.name} </span>
      </div>

      {/* Product details */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product images */}
        <div className="space-y-4 border border-gray-200 rounded-lg shadow-sm">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={selectedImage || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`w-20 h-20 rounded border-2 overflow-hidden flex-shrink-0 ${
                    selectedImage === image
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <div className="flex items-center mt-2">
              <Rating value={product.rating} />
              <span className="ml-2 text-sm text-gray-500">
                {product.numReviews}{" "}
                {product.numReviews === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>

          <div className="text-xl font-bold">
            {product.discountPrice ? (
              <div className="flex items-center">
                <span className="text-2xl">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="ml-2 text-gray-500 line-through text-lg">
                  ${product.price.toFixed(2)}
                </span>
                <span className="ml-2 bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                  {product.discountPercentage}% OFF
                </span>
              </div>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="border-t border-b py-4">
            <div className="prose max-w-none">{product.description}</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-gray-700 w-24">Availability:</span>
              {product.countInStock > 0 ? (
                <span className="text-green-600">In Stock</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>

            {product.brand && (
              <div className="flex items-center">
                <span className="text-gray-700 w-24">Brand:</span>
                <span>{product.brand}</span>
              </div>
            )}

            <div className="flex items-center">
              <span className="text-gray-700 w-24">Category:</span>
              <Link
                to={`/products?category=${
                  typeof product.category === "object"
                    ? product.category._id
                    : product.category
                }`}
                className="text-blue-600 hover:underline"
              >
                {typeof product.category === "object"
                  ? product.category.name
                  : product.category}
              </Link>
            </div>
          </div>

          {product.countInStock > 0 && (
            <div className="flex items-center space-x-4">
              <div className="w-24">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1 mr-2"
                >
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="input border cursor-pointer"
                >
                  {[...Array(Math.min(10, product.countInStock))].map(
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex  gap-2 px-4 py-2 bg-blue-600 text-white
                rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2 justify-center">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product description */}
      {product.richDescription && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-200 shadow-lg">
            {product.richDescription}
          </div>
        </div>
      )}

      {/* Reviews section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-secondary"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Write Your Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Summarize your review"
                />
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Write your review here"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full btn btn-primary"
              >
                {reviewSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      {/* Loading spinner SVG */}
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          <div className="">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white p-6 border border-gray-200 shadow-lg rounded-xl"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{review.title}</h4>
                    <div className="flex items-center mt-1">
                      <Rating value={review.rating} />
                      <span className="ml-2 text-sm text-gray-500 flex">
                        by
                        <span className="ml-1 font-medium">
                          {review.user?.name || "Anonymous"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="mt-4 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
