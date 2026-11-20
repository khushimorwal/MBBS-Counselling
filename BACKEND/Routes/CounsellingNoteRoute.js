const express = require("express");
const router = express.Router();

const auth = require("../Auth");

const {
  createCounsellingNote,
  getSessionNotes,
  getAllCounsellingNotes,
  getMyVisibleNotes,
  getMyCounsellingNotes,
  updateCounsellingNote,
  deleteCounsellingNote,
} = require("../CONTROLLERS/CounsellingNoteController");


console.log({
  createCounsellingNote: typeof createCounsellingNote,
  getSessionNotes: typeof getSessionNotes,
  getAllCounsellingNotes: typeof getAllCounsellingNotes,
  getMyVisibleNotes: typeof getMyVisibleNotes,
  getMyCounsellingNotes: typeof getMyCounsellingNotes,
  updateCounsellingNote: typeof updateCounsellingNote,
  deleteCounsellingNote: typeof deleteCounsellingNote,
});


// Create note
router.post("/create", auth, createCounsellingNote);

// Get notes
router.get("/all", auth, getAllCounsellingNotes);
router.get("/my-visible-notes", auth, getMyVisibleNotes);
router.get("/my-notes", auth, getMyCounsellingNotes);
router.get("/session/:sessionId", auth, getSessionNotes);

// Update and delete
router.put("/update/:id", auth, updateCounsellingNote);
router.delete("/delete/:id", auth, deleteCounsellingNote);

module.exports = router;

