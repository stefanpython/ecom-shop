const express = require("express");
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getAllPayments,
} = require("../controllers/paymentController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(protect, getPayments).post(protect, createPayment);

router.route("/admin").get(protect, admin, getAllPayments);

router
  .route("/:id")
  .get(protect, getPaymentById)
  .put(protect, admin, updatePaymentStatus);

module.exports = router;
