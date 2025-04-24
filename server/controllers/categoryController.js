const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");

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

  // Check if parent category exists if provided
  if (parent) {
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
    parent,
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
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.remove();
    res.json({ message: "Category removed" });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
