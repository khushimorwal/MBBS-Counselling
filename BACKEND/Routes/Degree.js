const express = require("express");
const router = express.Router();

const upload = require("../Middleware/uploadExcel");

const {
  bulkImportDegrees,
} = require("../CONTROLLERS/BulkDegree");

const {
createDegree,
getDegrees,
getDegreeById,
updateDegree,
deleteDegree,
} = require("../CONTROLLERS/DegreeController");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// Bulk Import Degrees
router.post(
  "/degrees/bulk-import",
  Auth,
  Permission("degrees.add"),
  upload.single("file"),
  bulkImportDegrees
);

// Create Degree
router.post(
"/degrees",
Auth,
Permission("degrees.add"),
createDegree
);

// View All Degrees
router.get(
"/degrees",
Auth,
Permission("degrees.view"),
getDegrees
);

// View Degree by ID
router.get(
"/degrees/:id",
Auth,
Permission("degrees.view"),
getDegreeById
);

// Update Degree
router.put(
"/degrees/:id",
Auth,
Permission("degrees.edit"),
updateDegree
);

// Delete Degree
router.delete(
"/degrees/:id",
Auth,
Permission("degrees.delete"),
deleteDegree
);

module.exports = router;

