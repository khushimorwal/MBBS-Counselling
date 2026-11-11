const express = require("express");
const router = express.Router();

const auth = require("../Auth");
const {
  getCounsellingDashboard,
} = require("../CONTROLLERS/CounsellingDashboardController");

router.get("/stats", auth, getCounsellingDashboard);

module.exports = router;