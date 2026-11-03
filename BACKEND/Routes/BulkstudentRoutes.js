const express = require("express");
const router = express.Router();

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");
const upload = require("../Middleware/uploadExcel");

const {
  bulkImportStudents,
} = require("../CONTROLLERS/Bulkstudent");

router.post(
  "/bulk-import",
  Auth,
  Permission("students.add"),
  upload.single("file"),
  bulkImportStudents
);

module.exports = router;