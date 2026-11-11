const express = require("express");
const router = express.Router();

const Auth = require("../Auth");

const {
  createEntranceExam,
  getEntranceExams,
  getEntranceExamById,
  updateEntranceExam,
  deleteEntranceExam,
} = require("../CONTROLLERS/EntranceController");

// Get All Entrance Exams
router.get("/", Auth, getEntranceExams);

// Get Entrance Exam By ID
router.get("/:id", Auth, getEntranceExamById);

// Create Entrance Exam
router.post("/", Auth, createEntranceExam);

// Update Entrance Exam
router.put("/:id", Auth, updateEntranceExam);

// Delete Entrance Exam
router.delete("/:id", Auth, deleteEntranceExam);

module.exports = router;
