const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    paymentMethod: {
      type: String,
      required: [true, "Please add a payment method"],
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
    currency: {
      type: String,
      required: [true, "Please add a currency"],
      default: "USD",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    transactionId: {
      type: String,
    },
    paymentDetails: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
