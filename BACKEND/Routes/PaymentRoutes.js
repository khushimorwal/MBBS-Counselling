const express = require("express");
const router = express.Router();

const Auth = require("../Auth");

const {
  createOrder,
  verifyPayment,
  activateFreePlan,
} = require("../CONTROLLERS/PackageController");

const studentOnly = (req, res, next) => {
  if (req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Only students can purchase plans",
    });
  }

  next();
};

router.post("/create-order", Auth, studentOnly, createOrder);
router.post("/verify-payment", Auth, studentOnly, verifyPayment);
router.post("/activate-free", Auth, studentOnly, activateFreePlan);

module.exports = router;