const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Review = require("../models/reviewModel");

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: "i" } },
          { description: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  const brand = req.query.brand ? { brand: req.query.brand } : {};
  const priceRange =
    req.query.priceMin && req.query.priceMax
      ? { price: { $gte: req.query.priceMin, $lte: req.query.priceMax } }
      : {};

  const sortOption = {};
  if (req.query.sortBy) {
    const sortField = req.query.sortBy;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    sortOption[sortField] = sortOrder;
  } else {
    sortOption["createdAt"] = -1; // Default sort by newest
  }

  const count = await Product.countDocuments({
    ...keyword,
    ...category,
    ...brand,
    ...priceRange,
  });
  const products = await Product.find({
    ...keyword,
    ...category,
    ...brand,
    ...priceRange,
  })
    .populate("category", "name")
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    richDescription,
    images,
    brand,
    category,
    countInStock,
    isFeatured,
    attributes,
    discountPrice,
    discountPercentage,
  } = req.body;

  // Create slug from name
  const slug = name.toLowerCase().replace(/ /g, "-");

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Invalid category");
  }

  // Check if product with same slug exists
  const productExists = await Product.findOne({ slug });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }

  const product = await Product.create({
    name,
    slug,
    price,
    description,
    richDescription,
    images,
    brand,
    category,
    countInStock,
    isFeatured,
    attributes,
    discountPrice,
    discountPercentage,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    richDescription,
    images,
    brand,
    category,
    countInStock,
    isFeatured,
    attributes,
    discountPrice,
    discountPercentage,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Update slug if name is changed
    const slug = name ? name.toLowerCase().replace(/ /g, "-") : product.slug;

    // Check if category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        res.status(400);
        throw new Error("Invalid category");
      }
    }

    product.name = name || product.name;
    product.slug = slug;
    product.price = price || product.price;
    product.description = description || product.description;
    product.richDescription = richDescription || product.richDescription;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock =
      countInStock !== undefined ? countInStock : product.countInStock;
    product.isFeatured =
      isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.attributes = attributes || product.attributes;
    product.discountPrice =
      discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.discountPercentage =
      discountPercentage !== undefined
        ? discountPercentage
        : product.discountPercentage;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: req.params.id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      product: req.params.id,
      rating: Number(rating),
      title,
      comment,
    });

    // Update product rating
    const reviews = await Review.find({ product: req.params.id });
    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(5);
  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const count = Number(req.query.count) || 8;
  const products = await Product.find({ isFeatured: true }).limit(count);
  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts,
};
