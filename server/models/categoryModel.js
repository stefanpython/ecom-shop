const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      unique: true,
    },
    description: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
