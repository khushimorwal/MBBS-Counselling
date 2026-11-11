const express = require("express");
const router = express.Router();

// Authentication middleware.
// Ensures only logged-in students can access profile APIs.
const Auth = require("../Auth");

// Middleware for handling file uploads.
const upload = require("../Middleware/upload");

// Import student profile controller functions.
const {
  getStudentProfile,
  saveStudentProfile,
  uploadProfileImage,
} = require("../CONTROLLERS/ProfileController");

// ======================================================
// GET STUDENT PROFILE
// Method: GET
// Route: /student-profile/
// Fetches the logged-in student's complete profile.
// ======================================================

router.get("/", Auth, getStudentProfile);

// ======================================================
// CREATE / UPDATE STUDENT PROFILE
// Method: PUT
// Route: /student-profile/
// Creates a profile or updates existing profile details.
// ======================================================

router.put("/", Auth, saveStudentProfile);

// ======================================================
// UPLOAD PROFILE IMAGE
// Method: PUT
// Route: /student-profile/profile-image
// Accepts an image using multipart/form-data.
// Field name: profileImage
// ======================================================

router.put(
  "/profile-image",
  Auth,
  upload.single("profileImage"),
  uploadProfileImage
);

// Export router for registration in server.js.
module.exports = router;