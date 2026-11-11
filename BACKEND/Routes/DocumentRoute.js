const express = require("express");
const router = express.Router();

const Auth = require("../Auth");
const upload = require("../Middleware/upload");

const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateDocumentStatus,
  getAllStudentDocuments,
} = require("../CONTROLLERS/Document"); 

// Get documents
router.get("/", Auth, getDocuments);

// Get all students' documents (Admin only)
router.get(
  "/all",
  Auth,
  (req, res, next) => {
    const allowedRoles = ["Super Admin", "Admin"];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can view all student documents",
      });
    }

    next();
  },
  getAllStudentDocuments
);

// Upload document
router.post(
  "/upload",
  Auth,
  upload.single("file"),
  uploadDocument
);

// Delete document
router.delete("/:documentType", Auth, deleteDocument);

// Update document status (Admin only)
router.put("/status", Auth, (req, res, next) => {
  const allowedRoles = ["Super Admin", "Admin"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only Admin can update document status",
    });
  }

  next();
}, updateDocumentStatus);

module.exports = router;