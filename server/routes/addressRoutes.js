const express = require("express");
const router = express.Router();
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getAddresses).post(protect, createAddress);

router
  .route("/:id")
  .get(protect, getAddressById)
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route("/:id/default").put(protect, setDefaultAddress);

module.exports = router;
