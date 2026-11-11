const express = require("express");
const router = express.Router();

const {
  createContact,
  getContacts,
} = require("../CONTROLLERS/ContactController");

const Auth = require("../Auth");

// Only Super Admin can view contact inquiries
router.get("/", Auth, requireSuperAdmin, getContacts);

// Public contact form submission
router.post("/", createContact);

// Super Admin access check
function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "Super Admin") {
    return res.status(403).json({
      status: false,
      message: "Only Super Admin can view contact inquiries",
    });
  }

  next();
}

module.exports = router;