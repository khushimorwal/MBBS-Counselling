const express = require("express");

const router = express.Router();

const upload = require("../Middleware/uploadExcel");

const {
  bulkImportSpecializations,
} = require("../CONTROLLERS/BulkSpecialization");

const {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
} = require(
  "../CONTROLLERS/SpecializationController"
);

const Auth = require("../Auth");
const Permission =
  require("../Middleware/Permission");

// Get all specializations
router.get(
  "/all",
  Auth,
  Permission("specializations.view"),
  getSpecializations
);

// Bulk Import
router.post(
  "/bulk-import",
  Auth,
  Permission("specializations.add"),
  upload.single("file"),
  bulkImportSpecializations
);

// Create specialization
router.post(
  "/create",
  Auth,
  Permission("specializations.add"),
  createSpecialization
);

// Get specialization by ID
router.get(
  "/details/:id",
  Auth,
  Permission("specializations.view"),
  getSpecializationById
);

// Update specialization
router.put(
  "/update/:id",
  Auth,
  Permission("specializations.edit"),
  updateSpecialization
);

// Delete specialization
router.delete(
  "/delete/:id",
  Auth,
  Permission("specializations.delete"),
  deleteSpecialization
);

module.exports = router;