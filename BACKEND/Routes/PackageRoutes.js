const express = require("express");
const router = express.Router();

const {
  getAllPackages,
} = require("../CONTROLLERS/PackageController");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "PackageRoutes working",
  });
});

router.get("/all", getAllPackages);

module.exports = router;