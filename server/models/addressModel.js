const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    addressLine1: {
      type: String,
      required: [true, "Please add address line 1"],
    },
    addressLine2: {
      type: String,
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
    },
    state: {
      type: String,
      required: [true, "Please add a state"],
    },
    postalCode: {
      type: String,
      required: [true, "Please add a postal code"],
    },
    country: {
      type: String,
      required: [true, "Please add a country"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Address", addressSchema);
