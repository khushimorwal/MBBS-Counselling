const mongoose = require("mongoose");

const Appointment = require("../Models/Appointment");
const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const User = require("../Models/User");

const isAdmin = (role) =>
  ["Admin", "Super Admin"].includes(role);

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const allowedModes = ["phone", "video", "in_person", "chat"];

const allowedStatuses = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
];

const activeStatuses = ["scheduled", "confirmed"];

const terminalRequestStatuses = [
  "closed",
  "converted",
  "cancelled",
];

const validateModeDetails = (mode, meetingLink, location) => {
  if (mode === "video" && !String(meetingLink || "").trim()) {
    return "Meeting link is required for video appointments.";
  }

  if (mode === "in_person" && !String(location || "").trim()) {
    return "Location is required for in-person appointments.";
  }

  return null;
};

const validateFutureTime = (start, end) => {
  return (
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    start > new Date() &&
    end > start
  );
};

// Check active assignment
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

  if (session) {
    query = query.session(session);
  }

  return query;
};

// Check appointment conflict
const checkAppointmentConflict = async ({
  student,
  counsellor,
  scheduledStart,
  scheduledEnd,
  excludeId,
  session,
}) => {
  const filter = {
    status: { $in: activeStatuses },
    scheduledStart: { $lt: scheduledEnd },
    scheduledEnd: { $gt: scheduledStart },
    $or: [{ student }, { counsellor }],
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  let query = Appointment.findOne(filter);

  if (session) {
    query = query.session(session);
  }

  return query;
};

// Check whether counsellor can manage this appointment
const canManageAppointment = async (user, appointment) => {
  if (isAdmin(user.role)) {
    return true;
  }

  if (
    user.role !== "Counsellor" ||
    appointment.counsellor.toString() !== user.id.toString()
  ) {
    return false;
  }

  const assignment = await getActiveAssignment(
    appointment.counsellingRequest,
    user.id
  );

  return Boolean(assignment);
};

// Populate appointment
const populateAppointment = (query) =>
  query
    .populate("student", "name email")
    .populate("counsellor", "name email")
    .populate("counsellingRequest", "requestNumber status")
    .populate("bookedBy", "name email")
    .populate("rescheduledFrom");

// ======================================================
// 1. SCHEDULE APPOINTMENT
// Admin / Super Admin / Assigned Counsellor
// ======================================================

exports.scheduleAppointment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      counsellingRequest,
      scheduledStart,
      scheduledEnd,
      mode,
      meetingLink,
      location,
      timezone,
    } = req.body;

    if (
      !counsellingRequest ||
      !scheduledStart ||
      !scheduledEnd ||
      !mode
    ) {
      return res.status(400).json({
        success: false,
        message: "Required appointment details are missing.",
      });
    }

    if (!isAdmin(req.user.role) && req.user.role !== "Counsellor") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to schedule appointments.",
      });
    }

    if (!isValidId(counsellingRequest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    if (!allowedModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment mode.",
      });
    }

    const modeError = validateModeDetails(
      mode,
      meetingLink,
      location
    );

    if (modeError) {
      return res.status(400).json({
        success: false,
        message: modeError,
      });
    }

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (!validateFutureTime(start, end)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid future appointment time.",
      });
    }

    let appointmentId;

    await session.withTransaction(async () => {
      const request = await CounsellingRequest.findById(
        counsellingRequest
      ).session(session);

      if (!request) {
        throw new Error("REQUEST_NOT_FOUND");
      }

      if (terminalRequestStatuses.includes(request.status)) {
        throw new Error("REQUEST_CLOSED");
      }

      const assignment = await CounsellingAssignment.findOne({
        counsellingRequest: request._id,
        status: "active",
      }).session(session);

      if (!assignment) {
        throw new Error("ASSIGNMENT_REQUIRED");
      }

      if (
        req.user.role === "Counsellor" &&
        assignment.counsellor.toString() !== req.user.id.toString()
      ) {
        throw new Error("NOT_ASSIGNED");
      }

      const conflict = await checkAppointmentConflict({
        student: request.student,
        counsellor: assignment.counsellor,
        scheduledStart: start,
        scheduledEnd: end,
        session,
      });

      if (conflict) {
        throw new Error("APPOINTMENT_CONFLICT");
      }

      const [appointment] = await Appointment.create(
        [
          {
            counsellingRequest: request._id,
            student: request.student,
            counsellor: assignment.counsellor,
            scheduledStart: start,
            scheduledEnd: end,
            timezone: timezone || "Asia/Kolkata",
            mode,
            meetingLink,
            location,
            bookedBy: req.user.id,
          },
        ],
        { session }
      );

      if (
        ["assigned", "contact_pending"].includes(request.status)
      ) {
        request.status = "in_progress";
        await request.save({ session });
      }

      appointmentId = appointment._id;
    });

    const appointment = await populateAppointment(
      Appointment.findById(appointmentId)
    );

    return res.status(201).json({
      success: true,
      message: "Appointment scheduled successfully.",
      data: appointment,
    });
  } catch (error) {
    console.error("Schedule Appointment Error:", error);

    const errors = {
      REQUEST_NOT_FOUND: [404, "Counselling request not found."],
      REQUEST_CLOSED: [400, "This counselling request is closed."],
      ASSIGNMENT_REQUIRED: [
        400,
        "Assign a counsellor before scheduling.",
      ],
      NOT_ASSIGNED: [
        403,
        "You can schedule only your assigned requests.",
      ],
      APPOINTMENT_CONFLICT: [
        409,
        "Student or counsellor already has an appointment during this time.",
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
      message: "Failed to schedule appointment.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// 2. GET ALL APPOINTMENTS
// Admin / Super Admin
// ======================================================

exports.getAllAppointments = async (req, res) => {
  try {
    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const {
      status,
      mode,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment status.",
        });
      }

      filter.status = status;
    }

    if (mode) {
      if (!allowedModes.includes(mode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment mode.",
        });
      }

      filter.mode = mode;
    }

    if (search && search.trim()) {
  const safeSearch = escapeRegex(search.trim());

  const users = await User.find({
    $or: [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ],
  }).select("_id");

  filter.$or = [
    { student: { $in: users.map((user) => user._id) } },
    { counsellor: { $in: users.map((user) => user._id) } },
  ];
}


    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(pageLimit) ||
      pageLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values.",
      });
    }

    const safeLimit = Math.min(pageLimit, 100);

    const [appointments, total] = await Promise.all([
      populateAppointment(
        Appointment.find(filter)
          .sort({ scheduledStart: -1 })
          .skip((pageNumber - 1) * safeLimit)
          .limit(safeLimit)
      ),

      Appointment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      appointments,
    });
  } catch (error) {
    console.error("Get All Appointments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: error.message,
    });
  }
};

// ======================================================
// 3. GET LOGGED-IN USER'S APPOINTMENTS
// ======================================================

exports.getMyAppointments = async (req, res) => {
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

    const appointments = await populateAppointment(
      Appointment.find(filter).sort({ scheduledStart: -1 })
    );

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Get My Appointments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. GET APPOINTMENT BY ID
// ======================================================

exports.getAppointmentById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await populateAppointment(
      Appointment.findById(req.params.id)
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // Check Student ownership
    const isStudentOwner =
      appointment.student?._id.toString() === req.user.id.toString();

    // Check active Counsellor assignment
    let isCounsellorOwner = false;

    if (
      req.user.role === "Counsellor" &&
      appointment.counsellor?._id.toString() === req.user.id.toString()
    ) {
      const activeAssignment = await CounsellingAssignment.findOne({
        counsellingRequest: appointment.counsellingRequest._id,
        counsellor: req.user.id,
        status: "active",
      });

      isCounsellorOwner = Boolean(activeAssignment);
    }

    // Access permission
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
      appointment,
    });
  } catch (error) {
    console.error("Get Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment.",
      error: error.message,
    });
  }
};

// ======================================================
// 5. CONFIRM APPOINTMENT
// Admin / Active Assigned Counsellor
// ======================================================

exports.confirmAppointment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (!(await canManageAppointment(req.user, appointment))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (appointment.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled appointments can be confirmed.",
      });
    }

    appointment.status = "confirmed";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed.",
      appointment,
    });
  } catch (error) {
    console.error("Confirm Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm appointment.",
      error: error.message,
    });
  }
};

// ======================================================
// 6. RESCHEDULE APPOINTMENT
// ======================================================

exports.rescheduleAppointment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      scheduledStart,
      scheduledEnd,
      mode,
      meetingLink,
      location,
      timezone,
    } = req.body;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    if (!scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: "New appointment start and end times are required.",
      });
    }

    let newAppointmentId;

    await session.withTransaction(async () => {
      const oldAppointment = await Appointment.findById(
        req.params.id
      ).session(session);

      if (!oldAppointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
      }

      if (!(await canManageAppointment(req.user, oldAppointment))) {
        throw new Error("NOT_AUTHORIZED");
      }

      if (!activeStatuses.includes(oldAppointment.status)) {
        throw new Error("INVALID_STATUS");
      }

      const request = await CounsellingRequest.findById(
        oldAppointment.counsellingRequest
      ).session(session);

      if (!request || terminalRequestStatuses.includes(request.status)) {
        throw new Error("REQUEST_CLOSED");
      }

      const start = new Date(scheduledStart);
      const end = new Date(scheduledEnd);

      if (!validateFutureTime(start, end)) {
        throw new Error("INVALID_TIME");
      }

      const newMode = mode || oldAppointment.mode;

      if (!allowedModes.includes(newMode)) {
        throw new Error("INVALID_MODE");
      }

      const newMeetingLink =
        meetingLink !== undefined
          ? meetingLink
          : oldAppointment.meetingLink;

      const newLocation =
        location !== undefined
          ? location
          : oldAppointment.location;

      const modeError = validateModeDetails(
        newMode,
        newMeetingLink,
        newLocation
      );

      if (modeError) {
        throw new Error("MODE_DETAILS_REQUIRED");
      }

      const conflict = await checkAppointmentConflict({
        student: oldAppointment.student,
        counsellor: oldAppointment.counsellor,
        scheduledStart: start,
        scheduledEnd: end,
        excludeId: oldAppointment._id,
        session,
      });

      if (conflict) {
        throw new Error("APPOINTMENT_CONFLICT");
      }

      const [newAppointment] = await Appointment.create(
        [
          {
            counsellingRequest: oldAppointment.counsellingRequest,
            student: oldAppointment.student,
            counsellor: oldAppointment.counsellor,
            scheduledStart: start,
            scheduledEnd: end,
            timezone: timezone || oldAppointment.timezone,
            mode: newMode,
            meetingLink: newMeetingLink,
            location: newLocation,
            bookedBy: req.user.id,
            rescheduledFrom: oldAppointment._id,
          },
        ],
        { session }
      );

      oldAppointment.status = "rescheduled";
      await oldAppointment.save({ session });

      newAppointmentId = newAppointment._id;
    });

    const appointment = await populateAppointment(
      Appointment.findById(newAppointmentId)
    );

    return res.status(201).json({
      success: true,
      message: "Appointment rescheduled successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Reschedule Appointment Error:", error);

    const errors = {
      APPOINTMENT_NOT_FOUND: [404, "Appointment not found."],
      NOT_AUTHORIZED: [403, "Access denied."],
      INVALID_STATUS: [400, "This appointment cannot be rescheduled."],
      REQUEST_CLOSED: [400, "This counselling request is closed."],
      INVALID_TIME: [
        400,
        "Please provide a valid future appointment time.",
      ],
      INVALID_MODE: [400, "Invalid appointment mode."],
      MODE_DETAILS_REQUIRED: [
        400,
        "Meeting link or location is required for the selected mode.",
      ],
      APPOINTMENT_CONFLICT: [
        409,
        "Student or counsellor already has an appointment during this time.",
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
      message: "Failed to reschedule appointment.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// 7. CANCEL APPOINTMENT
// Student can cancel own appointment.
// Admin / Active Assigned Counsellor can also cancel.
// ======================================================

exports.cancelAppointment = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const isStudentOwner =
      req.user.role === "Student" &&
      appointment.student.toString() === req.user.id.toString();

    const isAuthorizedCounsellor =
      req.user.role === "Counsellor" &&
      (await canManageAppointment(req.user, appointment));

    if (
      !isAdmin(req.user.role) &&
      !isStudentOwner &&
      !isAuthorizedCounsellor
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!activeStatuses.includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be cancelled.",
      });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = String(
      cancellationReason || ""
    ).trim();

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment.",
      error: error.message,
    });
  }
};

// ======================================================
// 8. COMPLETE APPOINTMENT
// Admin / Active Assigned Counsellor
// ======================================================

exports.completeAppointment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (!(await canManageAppointment(req.user, appointment))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!activeStatuses.includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be completed.",
      });
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment marked as completed.",
      appointment,
    });
  } catch (error) {
    console.error("Complete Appointment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete appointment.",
      error: error.message,
    });
  }
};

// ======================================================
// 9. MARK NO-SHOW
// Admin / Active Assigned Counsellor
// ======================================================

exports.markNoShow = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (!(await canManageAppointment(req.user, appointment))) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (!activeStatuses.includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be marked as no-show.",
      });
    }

    appointment.status = "no_show";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment marked as no-show.",
      appointment,
    });
  } catch (error) {
    console.error("Mark No-Show Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark appointment as no-show.",
      error: error.message,
    });
  }
};