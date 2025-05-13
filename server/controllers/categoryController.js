const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json(categories);
});

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent } = req.body;

  // Create slug from name
  const slug = name.toLowerCase().replace(/ /g, "-");

  // Check if category with same slug exists
  const categoryExists = await Category.findOne({ slug });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category with this name already exists");
  }

  // Only validate parent if it's provided and not empty
  if (parent && parent.trim() !== "") {
    const parentExists = await Category.findById(parent);
    if (!parentExists) {
      res.status(400);
      throw new Error("Parent category not found");
    }
  }

  const category = await Category.create({
    name,
    description,
    slug,
    image,
    parent: parent && parent.trim() !== "" ? parent : undefined, // Only set parent if it exists
  });

  if (category) {
    res.status(201).json(category);
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parent, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    // Update slug if name is changed
    const slug = name ? name.toLowerCase().replace(/ /g, "-") : category.slug;

    // Check if parent category exists if provided
    if (parent) {
      const parentExists = await Category.findById(parent);
      if (!parentExists) {
        res.status(400);
        throw new Error("Parent category not found");
      }
    }

    category.name = name || category.name;
    category.slug = slug;
    category.description = description || category.description;
    category.image = image || category.image;
    category.parent = parent || category.parent;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const childCategories = await Category.find({ parent: id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete category: It has subcategories. Delete or reassign them first.",
      });
    }

    const productsWithCategory = await Product.find({ category: id });
    if (productsWithCategory.length > 0) {
      return res.status(400).json({
        message: "Cannot delete category: It is assigned to products.",
      });
    }

    await Category.deleteOne({ _id: id });
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({
      message: "An unexpected error occurred while deleting the category",
    });
  }
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
