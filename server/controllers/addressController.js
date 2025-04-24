const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");

// @desc    Get all addresses for a user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
  });
  res.json(addresses);
});

// @desc    Get address by ID
// @route   GET /api/addresses/:id
// @access  Private
const getAddressById = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address) {
    // Check if address belongs to user
    if (
      address.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Not authorized");
    }
    res.json(address);
  } else {
    res.status(404);
    throw new Error("Address not found");
  }
});

// @desc    Create a new address
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
  const {
    name,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault,
  } = req.body;

  // If this is the default address, unset any existing default
  if (isDefault) {
    await Address.updateMany(
      { user: req.user._id, isDefault: true },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    user: req.user._id,
    name,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault: isDefault || false,
  });

  res.status(201).json(address);
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const {
    name,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault,
  } = req.body;

  const address = await Address.findById(req.params.id);

  if (address) {
    // Check if address belongs to user
    if (
      address.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // If this is being set as default, unset any existing default
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.user._id, isDefault: true },
        { isDefault: false }
      );
    }

    address.name = name || address.name;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 =
      addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.phone = phone || address.phone;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } else {
    res.status(404);
    throw new Error("Address not found");
  }
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address) {
    // Check if address belongs to user
    if (
      address.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Not authorized");
    }

    await address.remove();
    res.json({ message: "Address removed" });
  } else {
    res.status(404);
    throw new Error("Address not found");
  }
});

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address) {
    // Check if address belongs to user
    if (
      address.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // Unset any existing default
    await Address.updateMany(
      { user: req.user._id, isDefault: true },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } else {
    res.status(404);
    throw new Error("Address not found");
  }
});

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
