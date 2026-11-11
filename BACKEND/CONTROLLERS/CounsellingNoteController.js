
const mongoose = require("mongoose");

const CounsellingNote = require("../Models/CounsellingNote");
const CounsellingSession = require("../Models/CounsellingSession");
const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");

const isAdmin = (role) => ["Admin", "Super Admin"].includes(role);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedVisibility = ["internal", "student_visible"];

const allowedCategories = [
  "academic",
  "budget",
  "preferences",
  "follow_up",
  "general",
];

// ======================================================
// HELPERS
// ======================================================

const getActiveAssignment = (session) => {
  return CounsellingAssignment.findOne({
    counsellingRequest: session.counsellingRequest,
    counsellor: session.counsellor,
    status: "active",
  });
};

const canManageNotes = async (session, user) => {
  if (isAdmin(user.role)) return true;

  if (user.role !== "Counsellor") return false;

  const assignment = await getActiveAssignment(session);

  return Boolean(
    assignment &&
      session.counsellor.toString() === user.id.toString()
  );
};

// Common population for session, student and counsellor
const populateSessionDetails = {
  path: "session",
  select: "sessionNumber status student counsellor mode type",
  populate: [
    { path: "student", select: "name email" },
    { path: "counsellor", select: "name email" },
  ],
};

// ======================================================
// 1. CREATE COUNSELLING NOTE
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// ======================================================

exports.createCounsellingNote = async (req, res) => {
  try {
    const { session, visibility, category, content } = req.body;

    if (!session || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Session and note content are required.",
      });
    }

    if (content.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Note content cannot exceed 10000 characters.",
      });
    }

    if (!isAdmin(req.user.role) && req.user.role !== "Counsellor") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!isValidId(session)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    if (
      visibility !== undefined &&
      !allowedVisibility.includes(visibility)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid note visibility.",
      });
    }

    if (
      category !== undefined &&
      !allowedCategories.includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid note category.",
      });
    }

    const sessionRecord = await CounsellingSession.findById(session);

    if (!sessionRecord) {
      return res.status(404).json({
        success: false,
        message: "Counselling session not found.",
      });
    }

    if (!(await canManageNotes(sessionRecord, req.user))) {
      return res.status(403).json({
        success: false,
        message:
          "You can add notes only to sessions currently assigned to you.",
      });
    }

    const note = await CounsellingNote.create({
      session: sessionRecord._id,
      counsellingRequest: sessionRecord.counsellingRequest,
      author: req.user.id,
      visibility: visibility || "internal",
      category: category || "general",
      content: content.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Counselling note created successfully.",
      note,
    });
  } catch (error) {
    console.error("Create Counselling Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create counselling note.",
      error: error.message,
    });
  }
};

// ======================================================
// 2. GET NOTES FOR A SESSION
// STUDENT: STUDENT_VISIBLE ONLY
// ======================================================

exports.getSessionNotes = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!isValidId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    const session = await CounsellingSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Counselling session not found.",
      });
    }

    const isStudentOwner =
      req.user.role === "Student" &&
      session.student.toString() === req.user.id.toString();

    const isAdminUser = isAdmin(req.user.role);

    const isCounsellorManager =
      req.user.role === "Counsellor" &&
      (await canManageNotes(session, req.user));

    if (!isAdminUser && !isStudentOwner && !isCounsellorManager) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const filter = { session: session._id };

    if (isStudentOwner) {
      filter.visibility = "student_visible";
    }

    const notes = await CounsellingNote.find(filter)
      .populate({
        path: "session",
        select: "sessionNumber status student counsellor mode type",
        populate: [
          { path: "student", select: "name email" },
          { path: "counsellor", select: "name email" },
        ],
      })
      .populate("counsellingRequest", "requestNumber")
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Session Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch session notes.",
      error: error.message,
    });
  }
};

// ======================================================
// 3. GET ALL COUNSELLING NOTES
// ADMIN ONLY
// ======================================================

exports.getAllCounsellingNotes = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can view all counselling notes.",
      });
    }

    const filter = {};

    if (req.query.counsellingRequest) {
      if (!isValidId(req.query.counsellingRequest)) {
        return res.status(400).json({
          success: false,
          message: "Invalid counselling request ID.",
        });
      }

      filter.counsellingRequest = req.query.counsellingRequest;
    }

    if (req.query.visibility) {
      if (!allowedVisibility.includes(req.query.visibility)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note visibility.",
        });
      }

      filter.visibility = req.query.visibility;
    }

    if (req.query.category) {
      if (!allowedCategories.includes(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note category.",
        });
      }

      filter.category = req.query.category;
    }

    const notes = await CounsellingNote.find(filter)
      .populate({
        path: "session",
        select: "sessionNumber status student counsellor mode type",
        populate: [
          { path: "student", select: "name email" },
          { path: "counsellor", select: "name email" },
        ],
      })
      .populate("counsellingRequest", "requestNumber")
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get All Counselling Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling notes.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. GET NOTES VISIBLE TO LOGGED-IN STUDENT
// ======================================================

exports.getMyVisibleNotes = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is only for students.",
      });
    }

    const requestIds = await CounsellingRequest.find({
      student: req.user.id,
    }).distinct("_id");

    const notes = await CounsellingNote.find({
      counsellingRequest: { $in: requestIds },
      visibility: "student_visible",
    })
      .populate({
        path: "session",
        select: "sessionNumber status student counsellor mode type",
        populate: [
          { path: "student", select: "name email" },
          { path: "counsellor", select: "name email" },
        ],
      })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get My Visible Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your visible notes.",
      error: error.message,
    });
  }
};

// ======================================================
// 5. UPDATE COUNSELLING NOTE
// ADMIN / ACTIVE ASSIGNED AUTHOR COUNSELLOR
// ======================================================

exports.updateCounsellingNote = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling note ID.",
      });
    }

    const note = await CounsellingNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Counselling note not found.",
      });
    }

    const session = await CounsellingSession.findById(note.session);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Related counselling session not found.",
      });
    }

    if (!(await canManageNotes(session, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (
      req.user.role === "Counsellor" &&
      note.author.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can edit only notes created by you.",
      });
    }

    if (req.body.content !== undefined) {
      if (
        typeof req.body.content !== "string" ||
        !req.body.content.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Note content cannot be empty.",
        });
      }

      if (req.body.content.trim().length > 10000) {
        return res.status(400).json({
          success: false,
          message: "Note content cannot exceed 10000 characters.",
        });
      }

      note.content = req.body.content.trim();
    }

    if (req.body.visibility !== undefined) {
      if (!allowedVisibility.includes(req.body.visibility)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note visibility.",
        });
      }

      note.visibility = req.body.visibility;
    }

    if (req.body.category !== undefined) {
      if (!allowedCategories.includes(req.body.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note category.",
        });
      }

      note.category = req.body.category;
    }

    if (
      req.body.content === undefined &&
      req.body.visibility === undefined &&
      req.body.category === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update.",
      });
    }

    note.editedAt = new Date();

    await note.save();

    return res.status(200).json({
      success: true,
      message: "Counselling note updated successfully.",
      note,
    });
  } catch (error) {
    console.error("Update Counselling Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update counselling note.",
      error: error.message,
    });
  }
};

// ======================================================
// 6. DELETE COUNSELLING NOTE
// ADMIN ONLY
// ======================================================

exports.deleteCounsellingNote = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can delete counselling notes.",
      });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling note ID.",
      });
    }

    const note = await CounsellingNote.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Counselling note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Counselling note deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Counselling Note Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete counselling note.",
      error: error.message,
    });
  }
};