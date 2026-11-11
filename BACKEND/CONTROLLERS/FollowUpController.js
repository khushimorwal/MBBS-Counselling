const mongoose = require("mongoose");

const FollowUp = require("../Models/FollowUp");
const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const User = require("../Models/User");

const isAdmin = (role) => ["Admin", "Super Admin"].includes(role);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedTypes = ["call", "email", "document", "appointment", "other"];

const allowedStatuses = ["pending", "completed", "cancelled", "overdue"];

const terminalRequestStatuses = ["closed", "converted", "cancelled"];

const populateFollowUp = (query) => {
  return query
    .populate("student", "name email")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("counsellingRequest", "requestNumber status");
};

const getActiveAssignment = (requestId, counsellorId) => {
  const filter = {
    counsellingRequest: requestId,
    status: "active",
  };

  if (counsellorId) {
    filter.counsellor = counsellorId;
  }

  return CounsellingAssignment.findOne(filter);
};

const canManageFollowUp = async (followUp, user) => {
  if (isAdmin(user.role)) return true;

  if (user.role !== "Counsellor") return false;

  if (followUp.assignedTo.toString() !== user.id.toString()) {
    return false;
  }

  const assignment = await getActiveAssignment(
    followUp.counsellingRequest,
    user.id
  );

  return Boolean(assignment);
};

// ======================================================
// 1. CREATE FOLLOW-UP
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// ======================================================

exports.createFollowUp = async (req, res) => {
  try {
    const {
      counsellingRequest,
      title,
      description,
      dueAt,
      type,
      assignedTo,
    } = req.body;

    if (
      !counsellingRequest ||
      !assignedTo ||
      typeof title !== "string" ||
      !title.trim() ||
      !dueAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Counselling request, title, due date and assigned user are required.",
      });
    }

    if (!isAdmin(req.user.role) && req.user.role !== "Counsellor") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!isValidId(counsellingRequest) || !isValidId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request or assigned user ID.",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters.",
      });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" || description.length > 5000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string and cannot exceed 5000 characters.",
      });
    }

    if (type !== undefined && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up type.",
      });
    }

    const dueDate = new Date(dueAt);

    if (Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up due date.",
      });
    }

    const request = await CounsellingRequest.findById(counsellingRequest);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found.",
      });
    }

    if (terminalRequestStatuses.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot create a follow-up for a closed counselling request.",
      });
    }

    const assignment = await getActiveAssignment(request._id);

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "No active counsellor is assigned to this request.",
      });
    }

    if (
      req.user.role === "Counsellor" &&
      assignment.counsellor.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can create follow-ups only for your assigned requests.",
      });
    }

    if (
      assignment.counsellor.toString() !== assignedTo.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Follow-up must be assigned to the active counsellor.",
      });
    }

    const assignee = await User.findById(assignedTo).populate("roleId");

    if (!assignee || !assignee.roleId || assignee.roleId.role !== "Counsellor") {
      return res.status(400).json({
        success: false,
        message: "Assigned user must have the Counsellor role.",
      });
    }

    const followUp = await FollowUp.create({
      counsellingRequest: request._id,
      student: request.student,
      assignedTo: assignee._id,
      createdBy: req.user.id,
      title: title.trim(),
      description: description || "",
      dueAt: dueDate,
      type: type || "call",
      status: dueDate < new Date() ? "overdue" : "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully.",
      followUp,
    });
  } catch (error) {
    console.error("Create Follow-Up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create follow-up.",
      error: error.message,
    });
  }
};

// ======================================================
// 2. GET ALL FOLLOW-UPS
// ADMIN / SUPER ADMIN
// ======================================================

exports.getAllFollowUps = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const filter = {};

    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid follow-up status.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.type) {
      if (!allowedTypes.includes(req.query.type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid follow-up type.",
        });
      }

      filter.type = req.query.type;
    }

    if (req.query.assignedTo) {
      if (!isValidId(req.query.assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned user ID.",
        });
      }

      filter.assignedTo = req.query.assignedTo;
    }

    if (req.query.counsellingRequest) {
      if (!isValidId(req.query.counsellingRequest)) {
        return res.status(400).json({
          success: false,
          message: "Invalid counselling request ID.",
        });
      }

      filter.counsellingRequest = req.query.counsellingRequest;
    }

    const followUps = await populateFollowUp(
      FollowUp.find(filter).sort({ dueAt: 1 })
    );

    return res.status(200).json({
      success: true,
      total: followUps.length,
      followUps,
    });
  } catch (error) {
    console.error("Get All Follow-Ups Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch follow-ups.",
      error: error.message,
    });
  }
};

// ======================================================
// 3. GET LOGGED-IN USER'S FOLLOW-UPS
// ======================================================

exports.getMyFollowUps = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Student") {
      filter.student = req.user.id;
    } else if (req.user.role === "Counsellor") {
      filter.assignedTo = req.user.id;

      const activeAssignments = await CounsellingAssignment.find({
        counsellor: req.user.id,
        status: "active",
      }).distinct("counsellingRequest");

      filter.counsellingRequest = { $in: activeAssignments };
    } else if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const followUps = await populateFollowUp(
      FollowUp.find(filter).sort({ dueAt: 1 })
    );

    return res.status(200).json({
      success: true,
      total: followUps.length,
      followUps,
    });
  } catch (error) {
    console.error("Get My Follow-Ups Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your follow-ups.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. GET FOLLOW-UP BY ID
// ======================================================

exports.getFollowUpById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID.",
      });
    }

    const followUp = await populateFollowUp(
      FollowUp.findById(req.params.id)
    );

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    const isStudentOwner =
      req.user.role === "Student" &&
      followUp.student?._id.toString() === req.user.id.toString();

    const isManager = await canManageFollowUp(
      followUp,
      req.user
    );

    if (!isStudentOwner && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      followUp,
    });
  } catch (error) {
    console.error("Get Follow-Up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch follow-up.",
      error: error.message,
    });
  }
};

// ======================================================
// 5. UPDATE FOLLOW-UP
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// ======================================================

exports.updateFollowUp = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID.",
      });
    }

    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (!(await canManageFollowUp(followUp, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (["completed", "cancelled"].includes(followUp.status)) {
      return res.status(400).json({
        success: false,
        message: "Completed or cancelled follow-ups cannot be edited.",
      });
    }

    const { title, description, dueAt, type } = req.body;

    if (
      title === undefined &&
      description === undefined &&
      dueAt === undefined &&
      type === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update.",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty.",
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Title cannot exceed 200 characters.",
        });
      }

      followUp.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Description must be a string and cannot exceed 5000 characters.",
        });
      }

      followUp.description = description;
    }

    if (dueAt !== undefined) {
      const dueDate = new Date(dueAt);

      if (Number.isNaN(dueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date.",
        });
      }

      followUp.dueAt = dueDate;
      followUp.status = dueDate < new Date() ? "overdue" : "pending";
    }

    if (type !== undefined) {
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid follow-up type.",
        });
      }

      followUp.type = type;
    }

    await followUp.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up updated successfully.",
      followUp,
    });
  } catch (error) {
    console.error("Update Follow-Up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update follow-up.",
      error: error.message,
    });
  }
};

// ======================================================
// 6. COMPLETE FOLLOW-UP
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// ======================================================

exports.completeFollowUp = async (req, res) => {
  try {
    const { outcome } = req.body;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID.",
      });
    }

    if (
      outcome !== undefined &&
      (typeof outcome !== "string" || outcome.length > 5000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Outcome must be a string and cannot exceed 5000 characters.",
      });
    }

    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (!(await canManageFollowUp(followUp, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!["pending", "overdue"].includes(followUp.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or overdue follow-ups can be completed.",
      });
    }

    followUp.status = "completed";
    followUp.completedAt = new Date();
    followUp.outcome = outcome || "";

    await followUp.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up completed successfully.",
      followUp,
    });
  } catch (error) {
    console.error("Complete Follow-Up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete follow-up.",
      error: error.message,
    });
  }
};

// ======================================================
// 7. CANCEL FOLLOW-UP
// ADMIN ONLY
// ======================================================

exports.cancelFollowUp = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can cancel follow-ups.",
      });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID.",
      });
    }

    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found.",
      });
    }

    if (followUp.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed follow-ups cannot be cancelled.",
      });
    }

    if (followUp.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Follow-up is already cancelled.",
      });
    }

    followUp.status = "cancelled";

    await followUp.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up cancelled successfully.",
      followUp,
    });
  } catch (error) {
    console.error("Cancel Follow-Up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel follow-up.",
      error: error.message,
    });
  }
};

// ======================================================
// 8. UPDATE OVERDUE FOLLOW-UPS
// ADMIN ONLY
// ======================================================

exports.updateOverdueFollowUps = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const result = await FollowUp.updateMany(
      {
        status: "pending",
        dueAt: { $lt: new Date() },
      },
      {
        $set: { status: "overdue" },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Overdue follow-ups updated successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update Overdue Follow-Ups Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update overdue follow-ups.",
      error: error.message,
    });
  }
};