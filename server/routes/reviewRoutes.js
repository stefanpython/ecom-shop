const express = require("express");
const router = express.Router();
const {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
} = require("../controllers/reviewController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getReviews).post(protect, createReview);

router
  .route("/:id")
  .get(getReviewById)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.route("/:id/approve").put(protect, admin, approveReview);

module.exports = router;
