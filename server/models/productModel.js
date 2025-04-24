const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    richDescription: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    countInStock: {
      type: Number,
      required: [true, "Please add count in stock"],
      min: 0,
      max: 255,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attributes: {
      type: Object,
      default: {},
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for search
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
