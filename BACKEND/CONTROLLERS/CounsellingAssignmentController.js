const mongoose = require("mongoose");

const CounsellingAssignment = require("../Models/CounsellingAssignment");
const CounsellingRequest = require("../Models/CounsellingRequest");
const Appointment = require("../Models/Appointment");
const FollowUp = require("../Models/FollowUp");
const User = require("../Models/User");
const Role = require("../Models/Role");

// Helpers
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAdmin = (req) =>
  ["Admin", "Super Admin"].includes(req.user.role);

const isCounsellorUser = (req) =>
  req.user.role === "Counsellor";

const getValidCounsellor = async (counsellorId) => {
  const user = await User.findById(counsellorId).select("-password");

  if (!user) return null;

  const role = await Role.findById(user.roleId);

  if (!role || role.role !== "Counsellor") return null;

  return user;
};

const populateAssignment = (query) =>
  query
    .populate("counsellingRequest")
    .populate("counsellor", "name email")
    .populate("assignedBy", "name email")
    .populate("reassignedTo", "name email");

// 1. Assign Counsellor
exports.assignCounsellor = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can assign counsellors.",
      });
    }

    const { counsellingRequest, counsellor, assignmentType } = req.body;

    if (!isValidId(counsellingRequest) || !isValidId(counsellor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request or counsellor ID.",
      });
    }

    if (
      assignmentType &&
      !["manual", "automatic"].includes(assignmentType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment type.",
      });
    }

    const validCounsellor = await getValidCounsellor(counsellor);

    if (!validCounsellor) {
      return res.status(404).json({
        success: false,
        message: "Counsellor not found.",
      });
    }

    const session = await mongoose.startSession();

    try {
      let newAssignment;

      await session.withTransaction(async () => {
        const request = await CounsellingRequest.findById(
          counsellingRequest
        ).session(session);

        if (!request) {
          throw new Error("Counselling request not found.");
        }

        if (
          ["converted", "closed", "cancelled"].includes(request.status)
        ) {
          throw new Error(
            "This counselling request cannot be assigned."
          );
        }

        const activeAssignment = await CounsellingAssignment.findOne({
          counsellingRequest,
          status: "active",
        }).session(session);

        if (activeAssignment) {
          throw new Error(
            "This request already has an active counsellor."
          );
        }

        [newAssignment] = await CounsellingAssignment.create(
          [
            {
              counsellingRequest,
              counsellor,
              assignedBy: req.user.id,
              assignmentType: assignmentType || "manual",
              status: "active",
            },
          ],
          { session }
        );

        request.status = "assigned";
        await request.save({ session });
      });

      const result = await populateAssignment(
        CounsellingAssignment.findById(newAssignment._id)
      );

      return res.status(201).json({
        success: true,
        message: "Counsellor assigned successfully.",
        data: result,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Assignments
exports.getAllAssignments = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const { status, counsellor, page = 1, limit = 10 } = req.query;

    if (
      status &&
      !["active", "reassigned", "completed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment status.",
      });
    }

    if (counsellor && !isValidId(counsellor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counsellor ID.",
      });
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit)));

    if (!Number.isFinite(pageNumber) || !Number.isFinite(limitNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values.",
      });
    }

    const filter = {};

    if (status) filter.status = status;
    if (counsellor) filter.counsellor = counsellor;

    const total = await CounsellingAssignment.countDocuments(filter);

    const assignments = await populateAssignment(
      CounsellingAssignment.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
    );

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Assignment By ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await populateAssignment(
      CounsellingAssignment.findById(id)
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    if (
      !isAdmin(req) &&
      !(
        isCounsellorUser(req) &&
        assignment.counsellor._id.toString() === req.user.id.toString() &&
        assignment.status === "active"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get My Assignments
exports.getMyAssignments = async (req, res) => {
  try {
    if (!isCounsellorUser(req)) {
      return res.status(403).json({
        success: false,
        message: "Only counsellors can access their assignments.",
      });
    }

    const { status = "active" } = req.query;

    const allowedStatuses = [
      "active",
      "reassigned",
      "completed",
      "all",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment status.",
      });
    }

    const filter = {
      counsellor: req.user.id,
    };

    if (status !== "all") {
      filter.status = status;
    }

    const assignments = await populateAssignment(
      CounsellingAssignment.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      total: assignments.length,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Reassign Counselling Request
exports.reassignCounsellingRequest = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can reassign counsellors.",
      });
    }

    const { id } = req.params;
    const { counsellor, reassignmentReason } = req.body;

    if (!isValidId(id) || !isValidId(counsellor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment or counsellor ID.",
      });
    }

    const validCounsellor = await getValidCounsellor(counsellor);

    if (!validCounsellor) {
      return res.status(404).json({
        success: false,
        message: "New counsellor not found.",
      });
    }

    const session = await mongoose.startSession();

    try {
      let newAssignment;

      await session.withTransaction(async () => {
        const oldAssignment = await CounsellingAssignment.findById(
          id
        ).session(session);

        if (!oldAssignment || oldAssignment.status !== "active") {
          throw new Error("Active assignment not found.");
        }

        if (
          oldAssignment.counsellor.toString() === counsellor.toString()
        ) {
          throw new Error(
            "This counsellor is already assigned to this request."
          );
        }

        const request = await CounsellingRequest.findById(
          oldAssignment.counsellingRequest
        ).session(session);

        if (!request) {
          throw new Error("Counselling request not found.");
        }

        if (
          ["converted", "closed", "cancelled"].includes(request.status)
        ) {
          throw new Error(
            "This counselling request cannot be reassigned."
          );
        }

        // End old assignment
        oldAssignment.status = "reassigned";
        oldAssignment.reassignedTo = counsellor;
        oldAssignment.reassignmentReason =
          reassignmentReason || "Counsellor reassigned by Admin.";
        oldAssignment.endedAt = new Date();

        await oldAssignment.save({ session });

        // Cancel old counsellor's scheduled/confirmed appointments
        await Appointment.updateMany(
          {
            counsellingRequest: oldAssignment.counsellingRequest,
            counsellor: oldAssignment.counsellor,
            status: { $in: ["scheduled", "confirmed"] },
          },
          {
            $set: {
              status: "cancelled",
              cancellationReason:
                "Counsellor reassigned. Please schedule a new appointment.",
            },
          },
          { session }
        );

        // Transfer pending/overdue follow-ups to new counsellor
        await FollowUp.updateMany(
          {
            counsellingRequest: oldAssignment.counsellingRequest,
            assignedTo: oldAssignment.counsellor,
            status: { $in: ["pending", "overdue"] },
          },
          {
            $set: {
              assignedTo: counsellor,
            },
          },
          { session }
        );

        // Create new assignment
        [newAssignment] = await CounsellingAssignment.create(
          [
            {
              counsellingRequest: oldAssignment.counsellingRequest,
              counsellor,
              assignedBy: req.user.id,
              assignmentType: "manual",
              status: "active",
            },
          ],
          { session }
        );

        request.status = "assigned";
        await request.save({ session });
      });

      const result = await populateAssignment(
        CounsellingAssignment.findById(newAssignment._id)
      );

      return res.status(200).json({
        success: true,
        message:
          "Counselling request reassigned successfully. Appointments and follow-ups have been updated.",
        data: result,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 6. Complete Assignment
exports.completeAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const session = await mongoose.startSession();

    try {
      let completedAssignment;

      await session.withTransaction(async () => {
        const assignment = await CounsellingAssignment.findById(
          id
        ).session(session);

        if (!assignment || assignment.status !== "active") {
          throw new Error("Active assignment not found.");
        }

        const isAssignedCounsellor =
          isCounsellorUser(req) &&
          assignment.counsellor.toString() === req.user.id.toString();

        if (!isAdmin(req) && !isAssignedCounsellor) {
          throw new Error("Access denied.");
        }

        assignment.status = "completed";
        assignment.endedAt = new Date();

        await assignment.save({ session });

        const request = await CounsellingRequest.findById(
          assignment.counsellingRequest
        ).session(session);

        if (request && request.status === "assigned") {
          request.status = "in_progress";
          await request.save({ session });
        }

        completedAssignment = assignment;
      });

      const result = await populateAssignment(
        CounsellingAssignment.findById(completedAssignment._id)
      );

      return res.status(200).json({
        success: true,
        message: "Assignment completed successfully.",
        data: result,
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};