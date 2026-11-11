const express = require("express");
const router = express.Router();

const auth = require("../Auth");

const {
  assignCounsellor,
  getAllAssignments,
  getAssignmentById,
  getMyAssignments,
  reassignCounsellingRequest,
  completeAssignment,
} = require("../CONTROLLERS/CounsellingAssignmentController");

// Assign request to a counsellor
router.post("/assign", auth, assignCounsellor);

// Get all assignments
router.get("/all", auth, getAllAssignments);

// Get logged-in counsellor's assignments
router.get("/my-assignments", auth, getMyAssignments);

// Get assignment by ID
router.get("/:id", auth, getAssignmentById);

// Reassign request
router.patch("/reassign/:id", auth, reassignCounsellingRequest);

// Complete assignment
router.patch("/complete/:id", auth, completeAssignment);

module.exports = router;