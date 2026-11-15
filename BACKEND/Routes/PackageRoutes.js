const express = require("express");
const router = express.Router();

const {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../CONTROLLERS/PackageController");

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "PackageRoutes working",
  });
});

// Get all active packages
router.get("/all", getAllPackages);

// Create package
router.post("/create", createPackage);

// Update package
router.put("/update/:id", updatePackage);

// Delete package
router.delete("/delete/:id", deletePackage);

module.exports = router;