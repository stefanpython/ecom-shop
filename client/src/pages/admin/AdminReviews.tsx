"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { getReviews, approveReview, deleteReview } from "../../api/reviews";
import type { Review } from "../../types";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { CheckCircle, Trash2, Search, Star } from "lucide-react";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApproved, setFilterApproved] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled client-side for simplicity
  };

  const handleApprove = async (id: string) => {
    try {
      const updatedReview = await approveReview(id);
      setReviews(
        reviews.map((review) =>
          review._id === id
            ? { ...review, isApproved: updatedReview.isApproved }
            : review
        )
      );
      toast.success("Review approved successfully");
    } catch (error) {
      console.error("Error approving review:", error);
      toast.error("Failed to approve review");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(id);
        setReviews(reviews.filter((review) => review._id !== id));
        toast.success("Review deleted successfully");
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("Failed to delete review");
      }
    }
  };

  // Filter reviews based on search term and approval status
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      searchTerm === "" ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterApproved === "approved") {
      return matchesSearch && review.isApproved === true;
    } else if (filterApproved === "pending") {
      return matchesSearch && review.isApproved === false;
    }
    return matchesSearch;
  });

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Reviews</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews..."
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
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value)}
            className="input"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
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
                  Review
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rating
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
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
              {filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof review.product === "object"
                          ? review.product.name
                          : review.product.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {review.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-1">
                          {review.rating}
                        </span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          review.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
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

      {/* Mobile Cards (shown on mobile) */}
      <div className="md:hidden space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center p-6 text-gray-500">No reviews found</div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{review.title}</div>
                  <div className="text-sm text-gray-500">
                    {typeof review.product === "object"
                      ? review.product.name
                      : `Product ID: ${review.product.slice(-8)}`}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium mr-1">
                    {review.rating}
                  </span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-3">{review.comment}</div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">User:</span> {review.user?.name}
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      review.isApproved
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {review.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                {!review.isApproved && (
                  <button
                    onClick={() => handleApprove(review._id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Approve"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
