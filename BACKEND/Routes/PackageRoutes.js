const express = require("express");
const router = express.Router();

const Auth = require("../Auth");

const {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../CONTROLLERS/PackageController");

// Restrict package management to Admin and Super Admin
const adminOnly = (req, res, next) => {
  if (!["Admin", "Super Admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Admins can manage packages.",
    });
  }
  next();
};

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "PackageRoutes working",
  });
});

// Get all active packages (Public for students browsing packages)
router.get("/all", getAllPackages);

// Create package - Protected with Auth and Admin role check
router.post("/create", Auth, adminOnly, createPackage);

// Update package - Protected with Auth and Admin role check
router.put("/update/:id", Auth, adminOnly, updatePackage);

// Delete package - Protected with Auth and Admin role check
router.delete("/delete/:id", Auth, adminOnly, deletePackage);

module.exports = router;