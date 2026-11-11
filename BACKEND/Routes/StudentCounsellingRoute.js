const express = require("express");
const router = express.Router();

const auth = require("../Auth");
const {
  getMyCounsellingStatus,
} = require("../CONTROLLERS/StudentCounsellingController");

const studentOnly = (req, res, next) => {
  if (req.user.role !== "Student") {
    return res.status(403).json({
      success: false,
      message: "Only students can access this route.",
    });
  }

  next();
};

router.get("/my-status", auth, studentOnly, getMyCounsellingStatus);

module.exports = router;