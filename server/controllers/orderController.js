const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Payment = require("../models/paymentModel");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    billingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock -= item.quantity;
      await product.save();
    }
  }

  // Clear user's cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalItems: 0, totalPrice: 0 }
  );

  res.status(201).json(order);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("shippingAddress")
    .populate("billingAddress");

  if (order) {
    // Check if order belongs to user or user is admin
    if (
      order.user._id.toString() === req.user._id.toString() ||
      req.user.isAdmin
    ) {
      res.json(order);
    } else {
      res.status(401);
      throw new Error("Not authorized");
    }
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    // Create payment record
    await Payment.create({
      user: req.user._id,
      order: order._id,
      paymentMethod: order.paymentMethod,
      amount: order.totalPrice,
      status: "Completed",
      transactionId: req.body.id,
      paymentDetails: req.body,
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "Delivered";
    order.trackingNumber = req.body.trackingNumber || order.trackingNumber;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, notes } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status || order.status;

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (notes) {
      order.notes = notes;
    }

    // If status is delivered, update delivered status
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate("user", "id name")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize) });
});

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
};
