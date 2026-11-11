const express = require("express");
const router = express.Router();

const auth = require("../Auth");

const {
  createCounsellingSession,
  getAllCounsellingSessions,
  getMyCounsellingSessions,
  getCounsellingSessionById,
  updateCounsellingSession,
  completeCounsellingSession,
  cancelCounsellingSession,
} = require("../CONTROLLERS/CounsellingSessionController");

// Create session
router.post("/create", auth, createCounsellingSession);

// Get sessions
router.get("/all", auth, getAllCounsellingSessions);
router.get("/my-sessions", auth, getMyCounsellingSessions);

// Session actions
router.put("/update/:id", auth, updateCounsellingSession);
router.patch("/complete/:id", auth, completeCounsellingSession);
router.patch("/cancel/:id", auth, cancelCounsellingSession);

// Get session by ID
router.get("/:id", auth, getCounsellingSessionById);

module.exports = router;