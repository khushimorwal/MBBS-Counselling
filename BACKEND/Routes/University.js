const express = require("express");
const router = express.Router();

const upload = require("../Middleware/uploadExcel");

const {
  bulkImportUniversities,
} = require("../CONTROLLERS/BulkUniversity");

const {
addUniversity,
getUniversities,
getUniversityById,
updateUniversity,
deleteUniversity,
} = require("../CONTROLLERS/University");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// Add University
router.post(
"/universities",
Auth,
Permission("universities.add"),
addUniversity
);

// Bulk Import Universities
router.post(
  "/universities/bulk-import",
  Auth,
  Permission("universities.add"),
  upload.single("file"),
  bulkImportUniversities
);

// View Universities
router.get(
"/universities",
Auth,
Permission("universities.view"),
getUniversities
);

// View University by ID
router.get(
"/universities/:id",
Auth,
Permission("universities.view"),
getUniversityById
);

// Update University
router.put(
"/universities/:id",
Auth,
Permission("universities.edit"),
updateUniversity
);

// Delete University
router.delete(
"/universities/:id",
Auth,
Permission("universities.delete"),
deleteUniversity
);

module.exports = router;
