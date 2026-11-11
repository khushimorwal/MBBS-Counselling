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

router.post(
  "/create",
  Auth,
  Permission("applications.add"),
  createApplication
);

router.get(
  "/my-applications",
  Auth,
  Permission("applications.view"),
  getMyApplications
);

// Get all applications (Admin / Super Admin)
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