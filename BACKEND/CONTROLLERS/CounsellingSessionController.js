const mongoose = require("mongoose");

const CounsellingSession = require("../Models/CounsellingSession");
const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const Appointment = require("../Models/Appointment");
const FollowUp = require("../Models/FollowUp");

const isAdmin = (role) => ["Admin", "Super Admin"].includes(role);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedModes = ["phone", "video", "in_person", "chat"];

const allowedTypes = [
  "initial",
  "follow_up",
  "admission_guidance",
  "other",
];

const allowedOutcomes = [
  "counselling_completed",
  "follow_up_required",
  "recommendations_needed",
  "student_unreachable",
  "student_not_interested",
];

const terminalRequestStatuses = [
  "closed",
  "converted",
  "cancelled",
];

const getActiveAssignment = async (
  counsellingRequest,
  counsellor,
  session
) => {
  let query = CounsellingAssignment.findOne({
    counsellingRequest,
    counsellor,
    status: "active",
  });

  if (session) query = query.session(session);

  return query;
};

const canManageSession = async (counsellingSession, user) => {
  if (isAdmin(user.role)) return true;

  if (
    user.role !== "Counsellor" ||
    counsellingSession.counsellor.toString() !== user.id.toString()
  ) {
    return false;
  }

  const assignment = await getActiveAssignment(
    counsellingSession.counsellingRequest,
    user.id
  );

  return Boolean(assignment);
};

const populateSession = (query) =>
  query
    .populate("counsellingRequest", "requestNumber status")
    .populate("student", "name email")
    .populate("counsellor", "name email")
    .populate("appointment");

// ======================================================
// 1. CREATE COUNSELLING SESSION
// ======================================================

exports.createCounsellingSession = async (req, res) => {
  const dbSession = await mongoose.startSession();

  try {
    const {
      counsellingRequest,
      appointment,
      type,
      mode,
      studentQuestions,
      nextAction,
      nextFollowUpAt,
    } = req.body;

    if (!counsellingRequest || !mode) {
      return res.status(400).json({
        success: false,
        message: "Counselling request and session mode are required.",
      });
    }

    if (!isAdmin(req.user.role) && req.user.role !== "Counsellor") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!isValidId(counsellingRequest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    if (appointment && !isValidId(appointment)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session mode.",
      });
    }

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session type.",
      });
    }

    if (
      studentQuestions !== undefined &&
      (!Array.isArray(studentQuestions) ||
        !studentQuestions.every(
          (question) => typeof question === "string"
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Student questions must be an array of strings.",
      });
    }

    if (
      nextFollowUpAt &&
      (
        Number.isNaN(new Date(nextFollowUpAt).getTime()) ||
        new Date(nextFollowUpAt) <= new Date()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Next follow-up date must be a valid future date.",
      });
    }

    let createdSessionId;

    await dbSession.withTransaction(async () => {
      const request = await CounsellingRequest.findById(
        counsellingRequest
      ).session(dbSession);

      if (!request) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (terminalRequestStatuses.includes(request.status)) {
        throw new Error("REQUEST_CLOSED");
      }

      const assignment = await CounsellingAssignment.findOne({
        counsellingRequest: request._id,
        status: "active",
      }).session(dbSession);

      if (!assignment) {
        throw new Error("ASSIGNMENT_REQUIRED");
      }

      if (
        req.user.role === "Counsellor" &&
        assignment.counsellor.toString() !== req.user.id.toString()
      ) {
        throw new Error("NOT_ASSIGNED");
      }

      let appointmentRecord = null;

      if (appointment) {
        appointmentRecord = await Appointment.findOne({
          _id: appointment,
          counsellingRequest: request._id,
          student: request.student,
          counsellor: assignment.counsellor,
          status: { $in: ["scheduled", "confirmed"] },
        }).session(dbSession);

        if (!appointmentRecord) {
          throw new Error("INVALID_APPOINTMENT");
        }

        if (appointmentRecord.mode !== mode) {
          throw new Error("MODE_MISMATCH");
        }
      }

      const lastSession = await CounsellingSession.findOne({
        counsellingRequest: request._id,
      })
        .sort({ sessionNumber: -1 })
        .session(dbSession);

      const nextSessionNumber = lastSession
        ? lastSession.sessionNumber + 1
        : 1;

      const [newSession] = await CounsellingSession.create(
        [
          {
            counsellingRequest: request._id,
            appointment: appointmentRecord?._id,
            student: request.student,
            counsellor: assignment.counsellor,
            sessionNumber: nextSessionNumber,
            type: type || "initial",
            startedAt: new Date(),
            mode,
            studentQuestions: studentQuestions || [],
            nextAction,
            nextFollowUpAt: nextFollowUpAt
              ? new Date(nextFollowUpAt)
              : undefined,
          },
        ],
        { session: dbSession }
      );

      createdSessionId = newSession._id;
    });

    const createdSession = await populateSession(
      CounsellingSession.findById(createdSessionId)
    );

    return res.status(201).json({
      success: true,
      message: "Counselling session created successfully.",
      session: createdSession,
    });
  } catch (error) {
    console.error("Create Counselling Session Error:", error);

    const errors = {
      REQUEST_NOT_FOUND: [404, "Counselling request not found."],
      REQUEST_CLOSED: [
        400,
        "Cannot create a session for a closed counselling request.",
      ],
      ASSIGNMENT_REQUIRED: [
        400,
        "No active counsellor is assigned to this request.",
      ],
      NOT_ASSIGNED: [
        403,
        "You can create sessions only for your assigned requests.",
      ],
      INVALID_APPOINTMENT: [
        400,
        "Invalid appointment for this counselling request.",
      ],
      MODE_MISMATCH: [
        400,
        "Session mode must match the appointment mode.",
      ],
    };

    if (errors[error.message]) {
      return res.status(errors[error.message][0]).json({
        success: false,
        message: errors[error.message][1],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create counselling session.",
      error: error.message,
    });
  } finally {
    await dbSession.endSession();
  }
};

// ======================================================
// 2. GET ALL SESSIONS
// ADMIN ONLY
// ======================================================

exports.getAllCounsellingSessions = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
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

    if (req.query.status) {
      if (
        !["in_progress", "completed", "cancelled"].includes(
          req.query.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid session status.",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.counsellor) {
      if (!isValidId(req.query.counsellor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid counsellor ID.",
        });
      }

      filter.counsellor = req.query.counsellor;
    }

    const sessions = await populateSession(
      CounsellingSession.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      total: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get All Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling sessions.",
      error: error.message,
    });
  }
};

// ======================================================
// 3. GET LOGGED-IN USER'S SESSIONS
// ======================================================

exports.getMyCounsellingSessions = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Student") {
      filter.student = req.user.id;
    } else if (req.user.role === "Counsellor") {
      filter.counsellor = req.user.id;
    } else if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const sessions = await populateSession(
      CounsellingSession.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      total: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get My Sessions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your sessions.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. GET SESSION BY ID
// ======================================================

exports.getCounsellingSessionById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    const session = await populateSession(
      CounsellingSession.findById(req.params.id)
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Counselling session not found.",
      });
    }

    const isStudentOwner =
      session.student?._id.toString() === req.user.id.toString();

    let isCounsellorOwner = false;

    if (
      req.user.role === "Counsellor" &&
      session.counsellor?._id.toString() === req.user.id.toString()
    ) {
      const activeAssignment = await getActiveAssignment(
        session.counsellingRequest._id,
        req.user.id
      );

      isCounsellorOwner = Boolean(activeAssignment);
    }

    if (
      !isAdmin(req.user.role) &&
      !isStudentOwner &&
      !isCounsellorOwner
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling session.",
      error: error.message,
    });
  }
};

// ======================================================
// 5. UPDATE SESSION
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// ======================================================

exports.updateCounsellingSession = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    const session = await CounsellingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Counselling session not found.",
      });
    }

    if (!(await canManageSession(session, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress sessions can be updated.",
      });
    }

    const allowedFields = [
      "type",
      "mode",
      "outcome",
      "studentQuestions",
      "nextAction",
      "nextFollowUpAt",
    ];

    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;

      const value = req.body[field];

      if (
        field === "type" &&
        !allowedTypes.includes(value)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid session type.",
        });
      }

      if (
        field === "mode" &&
        !allowedModes.includes(value)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid session mode.",
        });
      }

      if (
        field === "outcome" &&
        value !== null &&
        !allowedOutcomes.includes(value)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid session outcome.",
        });
      }

      if (
        field === "studentQuestions" &&
        (
          !Array.isArray(value) ||
          !value.every((question) => typeof question === "string")
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Student questions must be an array of strings.",
        });
      }

      if (
        field === "nextFollowUpAt" &&
        value !== null &&
        (
          Number.isNaN(new Date(value).getTime()) ||
          new Date(value) <= new Date()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Next follow-up date must be a valid future date.",
        });
      }

      if (field === "nextFollowUpAt") {
        session.nextFollowUpAt = value
          ? new Date(value)
          : null;
      } else {
        session[field] = value;
      }
    }

    if (session.appointment && req.body.mode) {
      const appointment = await Appointment.findById(
        session.appointment
      );

      if (appointment && appointment.mode !== session.mode) {
        return res.status(400).json({
          success: false,
          message: "Session mode must match the linked appointment.",
        });
      }
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Counselling session updated successfully.",
      session,
    });
  } catch (error) {
    console.error("Update Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update counselling session.",
      error: error.message,
    });
  }
};

// ======================================================
// 6. COMPLETE SESSION
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// Automatically creates FollowUp when nextFollowUpAt is provided.
// ======================================================

exports.completeCounsellingSession = async (req, res) => {
  const dbSession = await mongoose.startSession();

  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    const { outcome, nextAction, nextFollowUpAt } = req.body;

    if (!outcome || !allowedOutcomes.includes(outcome)) {
      return res.status(400).json({
        success: false,
        message: "A valid session outcome is required.",
      });
    }

    if (
      nextFollowUpAt &&
      (
        Number.isNaN(new Date(nextFollowUpAt).getTime()) ||
        new Date(nextFollowUpAt) <= new Date()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Next follow-up date must be a valid future date.",
      });
    }

    let completedSessionId;
    let followUpCreated = false;

    await dbSession.withTransaction(async () => {
      const session = await CounsellingSession.findById(
        req.params.id
      ).session(dbSession);

      if (!session) {
        throw new Error("SESSION_NOT_FOUND");
      }

      if (!(await canManageSession(session, req.user))) {
        throw new Error("NOT_AUTHORIZED");
      }

      if (session.status !== "in_progress") {
        throw new Error("INVALID_SESSION_STATUS");
      }

      const request = await CounsellingRequest.findById(
        session.counsellingRequest
      ).session(dbSession);

      if (!request) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      const endedAt = new Date();

      session.endedAt = endedAt;

      session.durationMinutes = session.startedAt
        ? Math.max(
            0,
            Math.round(
              (endedAt - session.startedAt) / 60000
            )
          )
        : 0;

      session.status = "completed";
      session.outcome = outcome;

      if (nextAction !== undefined) {
        session.nextAction = nextAction;
      }

      if (nextFollowUpAt !== undefined) {
        session.nextFollowUpAt = nextFollowUpAt
          ? new Date(nextFollowUpAt)
          : null;
      }

      await session.save({ session: dbSession });

      // Automatically create follow-up
      if (session.nextFollowUpAt) {
        const activeAssignment = await getActiveAssignment(
          session.counsellingRequest,
          session.counsellor,
          dbSession
        );

        if (!activeAssignment) {
          throw new Error("ASSIGNMENT_REQUIRED");
        }

        await FollowUp.create(
          [
            {
              counsellingRequest: session.counsellingRequest,
              student: session.student,
              assignedTo: session.counsellor,
              createdBy: req.user.id,
              title: "Counselling Session Follow-up",
              description:
                session.nextAction ||
                "Follow up with the student after the counselling session.",
              dueAt: session.nextFollowUpAt,
              type: "call",
              status: "pending",
            },
          ],
          { session: dbSession }
        );

        followUpCreated = true;
      }

      completedSessionId = session._id;
    });

    const completedSession = await populateSession(
      CounsellingSession.findById(completedSessionId)
    );

    return res.status(200).json({
      success: true,
      message: "Counselling session completed successfully.",
      followUpCreated,
      session: completedSession,
    });
  } catch (error) {
    console.error("Complete Session Error:", error);

    const errors = {
      SESSION_NOT_FOUND: [404, "Counselling session not found."],
      NOT_AUTHORIZED: [403, "Access denied."],
      INVALID_SESSION_STATUS: [
        400,
        "Only in-progress sessions can be completed.",
      ],
      REQUEST_NOT_FOUND: [404, "Counselling request not found."],
      ASSIGNMENT_REQUIRED: [
        400,
        "An active counsellor assignment is required to create a follow-up.",
      ],
    };

    if (errors[error.message]) {
      return res.status(errors[error.message][0]).json({
        success: false,
        message: errors[error.message][1],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to complete counselling session.",
      error: error.message,
    });
  } finally {
    await dbSession.endSession();
  }
};

// ======================================================
// 7. CANCEL SESSION
// ADMIN / ACTIVE ASSIGNED COUNSELLOR
// ======================================================

exports.cancelCounsellingSession = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    const session = await CounsellingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Counselling session not found.",
      });
    }

    if (!(await canManageSession(session, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress sessions can be cancelled.",
      });
    }

    session.status = "cancelled";
    session.endedAt = new Date();

    session.durationMinutes = session.startedAt
      ? Math.max(
          0,
          Math.round(
            (session.endedAt - session.startedAt) / 60000
          )
        )
      : 0;

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Counselling session cancelled.",
      session,
    });
  } catch (error) {
    console.error("Cancel Session Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel counselling session.",
      error: error.message,
    });
  }
};