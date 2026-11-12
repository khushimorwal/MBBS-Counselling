const express = require("express");
const router = express.Router();

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

const {
  createApplication,
  getMyApplications,
  updateApplicationStatus,
  getAllApplications
} = require("../CONTROLLERS/ApplicationController");

// Frontend user - create own application
router.post(
  "/create",
  Auth,
  createApplication
);

// Frontend user - view own applications
router.get(
  "/my-applications",
  Auth,
  getMyApplications
);

// Admin / Super Admin
router.get(
  "/all",
  Auth,
  Permission("applications.view"),
  getAllApplications
);

router.put(
  "/update-status/:id",
  Auth,
  Permission("applications.edit"),
  updateApplicationStatus
);

module.exports = router;