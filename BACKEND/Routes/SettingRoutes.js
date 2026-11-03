const express = require("express");

const router = express.Router();

const {
  getSettings,
  updateSettings,
} = require("../CONTROLLERS/SettingController");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// Get Settings
router.get(
  "/",
  Auth,
  Permission("settings.view"),
  getSettings
);

// Update Settings
router.put(
  "/",
  Auth,
  Permission("settings.edit"),
  updateSettings
);

module.exports = router;