const asyncHandler = require("express-async-handler");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const productId = req.query.product;
  const userId = req.query.user;

  const query = {};

  if (productId) {
    query.product = productId;
  }

  if (userId) {
    query.user = userId;
  }

  const reviews = await Review.find(query)
    .populate("user", "name")
    .populate("product", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name")
    .populate("product", "name");

  if (review) {
    res.json(review);
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Product already reviewed");
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    product,
    rating: Number(rating),
    title,
    comment,
  });

  // Update product rating
  const reviews = await Review.find({ product });
  productExists.numReviews = reviews.length;
  productExists.rating =
    reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

  await productExists.save();

  res.status(201).json(review);
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (review) {
    // Check if review belongs to user
    if (
      review.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Not authorized");
    }

    review.rating = Number(rating) || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();

    // Update product rating
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: review.product });
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Check if review belongs to user or user is admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Not authorized");
    }

    await review.remove();

    // Update product rating
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: review.product });

    if (reviews.length > 0) {
      product.numReviews = reviews.length;
      product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    } else {
      product.numReviews = 0;
      product.rating = 0;
    }

    await product.save();

    res.json({ message: "Review removed" });
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

// @desc    Approve a review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    review.isApproved = true;
    const updatedReview = await review.save();
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
};
