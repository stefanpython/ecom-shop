const asyncHandler = require("express-async-handler");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");

// @desc    Get all payments for a user
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate("order", "totalPrice isPaid paidAt")
    .sort({ createdAt: -1 });
  res.json(payments);
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate("order", "totalPrice isPaid paidAt")
    .populate("user", "name email");

  if (payment) {
    // Check if payment belongs to user or user is admin
    if (
      payment.user._id.toString() === req.user._id.toString() ||
      req.user.isAdmin
    ) {
      res.json(payment);
    } else {
      res.status(401);
      throw new Error("Not authorized");
    }
  } else {
    res.status(404);
    throw new Error("Payment not found");
  }
});

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const {
    order: orderId,
    paymentMethod,
    amount,
    currency,
    status,
    transactionId,
    paymentDetails,
  } = req.body;

  // Check if order exists
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Create payment
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    paymentMethod,
    amount,
    currency: currency || "USD",
    status,
    transactionId,
    paymentDetails,
  });

  // Update order if payment is completed
  if (status === "Completed") {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: transactionId,
      status,
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    await order.save();
  }

  res.status(201).json(payment);
});

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, transactionId } = req.body;
  const payment = await Payment.findById(req.params.id);

  if (payment) {
    payment.status = status || payment.status;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    const updatedPayment = await payment.save();

    // Update order if payment status changes
    if (status === "Completed") {
      const order = await Order.findById(payment.order);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: payment.transactionId || "manual",
          status,
          update_time: new Date().toISOString(),
          email_address: "",
        };
        await order.save();
      }
    }

    res.json(updatedPayment);
  } else {
    res.status(404);
    throw new Error("Payment not found");
  }
});

// @desc    Get all payments
// @route   GET /api/payments/admin
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Payment.countDocuments({});
  const payments = await Payment.find({})
    .populate("user", "id name email")
    .populate("order", "totalPrice isPaid paidAt")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ payments, page, pages: Math.ceil(count / pageSize) });
});

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getAllPayments,
};
