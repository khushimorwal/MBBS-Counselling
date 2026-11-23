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


// Restrict note creation and modification to Counsellor, Admin and Super Admin
const counsellorOrAdmin = (req, res, next) => {
  if (!["Counsellor", "Admin", "Super Admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only Counsellors and Admins can create or modify counselling notes.",
    });
  }
  next();
};

// Create note
router.post("/create", auth, counsellorOrAdmin, createCounsellingNote);

// Get notes
router.get("/all", auth, getAllCounsellingNotes);
router.get("/my-visible-notes", auth, getMyVisibleNotes);
router.get("/my-notes", auth, getMyCounsellingNotes);
router.get("/session/:sessionId", auth, getSessionNotes);

// Update and delete
router.put("/update/:id", auth, counsellorOrAdmin, updateCounsellingNote);
router.delete("/delete/:id", auth, counsellorOrAdmin, deleteCounsellingNote);

module.exports = router;

