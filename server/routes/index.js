var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("API is running ✅");
});

// Add a simple ping endpoint for health checks
router.get("/api/ping", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

module.exports = router;
