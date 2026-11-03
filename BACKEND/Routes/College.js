const express = require("express");

const router = express.Router();

// Excel upload middleware
const upload = require("../Middleware/uploadExcel");

// Bulk College Controller
const {
  bulkImportColleges,
} = require("../CONTROLLERS/BulkCollege");

// College CRUD Controller
const {
  addCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} = require("../CONTROLLERS/CollegeController");

// College Details Controller
const {
  fetchCollegeDetails,
} = require("../CONTROLLERS/CollegeDetail");

const Auth = require("../Auth");

const Permission = require("../Middleware/Permission");

// Create college
router.post(
  "/create",
  Auth,
  Permission("colleges.add"),
  addCollege
);

// Get all colleges
router.get(
  "/get-college",
  Auth,
  Permission("colleges.view"),
  getColleges
);

// Get college by ID
router.get(
  "/get-by-id/:id",
  Auth,
  Permission("colleges.view"),
  getCollegeById
);

// Update college
router.put(
  "/update/:id",
  Auth,
  Permission("colleges.edit"),
  updateCollege
);

// Delete college
router.delete(
  "/delete/:id",
  Auth,
  Permission("colleges.delete"),
  deleteCollege
);

// Fetch official college details and save to MongoDB
router.post(
  "/fetch-official-details",
  Auth,
  Permission("colleges.add"),
  fetchCollegeDetails
);

// Bulk import colleges through Excel
router.post(
  "/bulk-import",
  Auth,
  Permission("colleges.add"),
  upload.single("file"),
  bulkImportColleges
);

module.exports = router;