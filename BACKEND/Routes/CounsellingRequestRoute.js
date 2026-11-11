const express = require("express");
const router = express.Router();

const auth = require("../Auth");

const {
  createCounsellingRequest,
  getAllCounsellingRequests,
  getMyCounsellingRequests,
  getCounsellingRequestById,
  updateCounsellingRequest,
  updateCounsellingRequestStatus,
  deleteCounsellingRequest,
} = require("../CONTROLLERS/CounsellingRequestController");

// Create a counselling request.
router.post("/create", auth, createCounsellingRequest);

// Get logged-in student's counselling requests.
router.get("/my-requests", auth, getMyCounsellingRequests);

// Get all counselling requests.
router.get("/all", auth, getAllCounsellingRequests);

// Get a single counselling request.
router.get("/:id", auth, getCounsellingRequestById);

// Update counselling request details.
router.put("/update/:id", auth, updateCounsellingRequest);

// Update counselling request status.
router.patch("/status/:id", auth, updateCounsellingRequestStatus);

// Delete counselling request.
router.delete("/delete/:id", auth, deleteCounsellingRequest);

module.exports = router;

