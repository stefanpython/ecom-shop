const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "name images price countInStock",
  });

  if (cart) {
    res.json(cart);
  } else {
    // Create empty cart if not exists
    const newCart = await Cart.create({
      user: req.user._id,
      items: [],
      totalPrice: 0,
      totalItems: 0,
    });
    res.json(newCart);
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, attributes = {} } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if product is in stock
  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error("Product is out of stock");
  }

  // Find user's cart
  let cart = await Cart.findOne({ user: req.user._id });

  // Create cart if not exists
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalPrice: 0,
      totalItems: 0,
    });
  }

  // Check if item already in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Update quantity if item exists
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      attributes,
    });
  }

  // Calculate totals
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Save cart
  await cart.save();

  // Return updated cart with populated product details
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name images price countInStock",
  });

  res.status(201).json(updatedCart);
});

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity, attributes } = req.body;
  const itemId = req.params.itemId;

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  // Check product stock
  const product = await Product.findById(cart.items[itemIndex].product);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error("Product is out of stock");
  }

  // Update item
  if (quantity) {
    cart.items[itemIndex].quantity = quantity;
  }

  if (attributes) {
    cart.items[itemIndex].attributes = attributes;
  }

  // Calculate totals
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Save cart
  await cart.save();

  // Return updated cart with populated product details
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name images price countInStock",
  });

  res.json(updatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const itemId = req.params.itemId;

  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Remove item
  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

  // Calculate totals
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Save cart
  await cart.save();

  // Return updated cart with populated product details
  const updatedCart = await Cart.findById(cart._id).populate({
    path: "items.product",
    select: "name images price countInStock",
  });

  res.json(updatedCart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  // Find user's cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Clear items
  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;

  // Save cart
  await cart.save();

  res.json({ message: "Cart cleared" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
