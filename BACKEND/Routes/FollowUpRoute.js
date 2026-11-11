const express = require("express");
const router = express.Router();

const auth = require("../Auth");

const {
  createFollowUp,
  getAllFollowUps,
  getMyFollowUps,
  getFollowUpById,
  updateFollowUp,
  completeFollowUp,
  cancelFollowUp,
  updateOverdueFollowUps,
} = require("../CONTROLLERS/FollowUpController");

// Create follow-up
router.post("/create", auth, createFollowUp);

// Get follow-ups
router.get("/all", auth, getAllFollowUps);
router.get("/my-followups", auth, getMyFollowUps);

// Update overdue follow-ups
router.patch("/update-overdue", auth, updateOverdueFollowUps);

// Follow-up actions
router.put("/update/:id", auth, updateFollowUp);
router.patch("/complete/:id", auth, completeFollowUp);
router.patch("/cancel/:id", auth, cancelFollowUp);

// Get follow-up by ID
router.get("/:id", auth, getFollowUpById);

module.exports = router;