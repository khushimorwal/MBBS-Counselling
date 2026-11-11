const mongoose = require("mongoose");
const crypto = require("crypto");

const CounsellingRequest = require("../Models/CounsellingRequest");
const StudentProfile = require("../Models/StudentProfile");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const Appointment = require("../Models/Appointment");
const CounsellingSession = require("../Models/CounsellingSession");
const CounsellingNote = require("../Models/CounsellingNote");
const FollowUp = require("../Models/FollowUp");
const User = require("../Models/User");

// ======================================================
// HELPERS
// ======================================================

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isAdmin = (role) => ["Super Admin", "Admin"].includes(role);

const isCounsellor = (role) => role === "Counsellor";

const allowedLevels = ["UG", "PG", "Diploma", "Doctorate", "Other"];

const allowedModes = ["phone", "video", "in_person", "chat"];

const allowedStatuses = [
  "new",
  "assigned",
  "contact_pending",
  "in_progress",
  "recommendations_shared",
  "converted",
  "closed",
  "cancelled",
];

const terminalStatuses = ["converted", "closed", "cancelled"];

const generateRequestNumber = () => {
  const year = new Date().getFullYear();
  const uniqueCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `CR-${year}-${uniqueCode}`;
};

const getActiveAssignment = (requestId, counsellorId) => {
  return CounsellingAssignment.findOne({
    counsellingRequest: requestId,
    counsellor: counsellorId,
    status: "active",
  });
};

const validateIdArray = (items) => {
  return (
    Array.isArray(items) &&
    items.every((item) => isValidId(item))
  );
};

const validateLocations = (locations) => {
  return (
    Array.isArray(locations) &&
    locations.every(
      (location) =>
        location &&
        typeof location === "object" &&
        !Array.isArray(location) &&
        ["city", "state", "country"].every(
          (key) =>
            location[key] === undefined ||
            typeof location[key] === "string"
        )
    )
  );
};

const validateBudget = (budget) => {
  if (!budget || typeof budget !== "object" || Array.isArray(budget)) {
    return false;
  }

  const { min, max, currency } = budget;

  if (
    min !== undefined &&
    (!Number.isFinite(Number(min)) || Number(min) < 0)
  ) {
    return false;
  }

  if (
    max !== undefined &&
    (!Number.isFinite(Number(max)) || Number(max) < 0)
  ) {
    return false;
  }

  if (
    min !== undefined &&
    max !== undefined &&
    Number(min) > Number(max)
  ) {
    return false;
  }

  if (currency !== undefined && typeof currency !== "string") {
    return false;
  }

  return true;
};

const validateEntranceExams = (exams) => {
  if (!Array.isArray(exams)) return false;

  return exams.every((item) => {
    if (!item || typeof item !== "object" || !isValidId(item.exam)) {
      return false;
    }

    const numericFields = [
      "score",
      "percentile",
      "rank",
      "year",
    ];

    return numericFields.every(
      (field) =>
        item[field] === undefined ||
        item[field] === null ||
        Number.isFinite(Number(item[field]))
    );
  });
};

const validatePreferredTime = (preferredTime) => {
  if (
    !preferredTime ||
    typeof preferredTime !== "object" ||
    Array.isArray(preferredTime)
  ) {
    return false;
  }

  if (preferredTime.date !== undefined) {
    const date = new Date(preferredTime.date);

    if (Number.isNaN(date.getTime())) return false;
  }

  if (
    preferredTime.timezone !== undefined &&
    typeof preferredTime.timezone !== "string"
  ) {
    return false;
  }

  return true;
};

// ======================================================
// 1. CREATE COUNSELLING REQUEST
// STUDENT ONLY
// ======================================================

exports.createCounsellingRequest = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit counselling requests.",
      });
    }

    const {
      academicYear,
      admissionLevel,
      preferredStreams,
      preferredCourses,
      preferredLocations,
      budget,
      entranceExams,
      counsellingMode,
      preferredTime,
    } = req.body;

    if (
      typeof academicYear !== "string" ||
      !academicYear.trim() ||
      !admissionLevel
    ) {
      return res.status(400).json({
        success: false,
        message: "Academic year and admission level are required.",
      });
    }

    if (!allowedLevels.includes(admissionLevel)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admission level.",
      });
    }

    if (
      counsellingMode !== undefined &&
      !allowedModes.includes(counsellingMode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling mode.",
      });
    }

    if (
      preferredStreams !== undefined &&
      !validateIdArray(preferredStreams)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred streams.",
      });
    }

    if (
      preferredCourses !== undefined &&
      !validateIdArray(preferredCourses)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred courses.",
      });
    }

    if (
      preferredLocations !== undefined &&
      !validateLocations(preferredLocations)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred locations.",
      });
    }

    if (budget !== undefined && !validateBudget(budget)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget details.",
      });
    }

    if (
      entranceExams !== undefined &&
      !validateEntranceExams(entranceExams)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid entrance exam details.",
      });
    }

    if (
      preferredTime !== undefined &&
      !validatePreferredTime(preferredTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid preferred time.",
      });
    }

    const profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    const profileEntranceExams = (profile?.entranceExams || [])
      .filter((item) => item.exam)
      .map((item) => ({
        exam: item.exam,
        score: item.score,
        percentile: item.percentile,
        rank: item.rank || item.air,
        year: item.year || item.examYear,
      }));

    const profileLocations = (
      profile?.preferredLocationDetails || []
    ).map((location) => ({
      city: location.city || "",
      state: location.state || "",
      country: location.country || "India",
    }));

    const finalLocations =
      preferredLocations?.length
        ? preferredLocations
        : profileLocations;

    const finalCourses =
      preferredCourses?.length
        ? preferredCourses
        : profile?.preferredCourses || [];

    const finalStreams = preferredStreams || [];

    const finalBudget =
      budget || {
        min: profile?.budget?.min,
        max: profile?.budget?.max,
        currency: "INR",
      };

    const finalEntranceExams =
      entranceExams?.length
        ? entranceExams
        : profileEntranceExams;

    if (
      finalBudget.min !== undefined &&
      finalBudget.max !== undefined &&
      Number(finalBudget.min) > Number(finalBudget.max)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum budget cannot be greater than maximum budget.",
      });
    }

    let requestNumber;

    // Generate a unique request number.
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateRequestNumber();

      const exists = await CounsellingRequest.exists({
        requestNumber: candidate,
      });

      if (!exists) {
        requestNumber = candidate;
        break;
      }
    }

    if (!requestNumber) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate request number. Please try again.",
      });
    }

    const request = await CounsellingRequest.create({
      requestNumber,
      student: req.user.id,
      academicYear: academicYear.trim(),
      admissionLevel,
      preferredStreams: finalStreams,
      preferredCourses: finalCourses,
      preferredLocations: finalLocations,
      budget: finalBudget,
      entranceExams: finalEntranceExams,
      counsellingMode: counsellingMode || "phone",
      preferredTime: preferredTime || {},
      source: "website",
      priority: "normal",
      status: "new",
    });

    return res.status(201).json({
      success: true,
      message: "Counselling request submitted successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Create Counselling Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create counselling request.",
      error: error.message,
    });
  }
};

// ======================================================
// 2. GET ALL COUNSELLING REQUESTS
// ADMIN: ALL
// STUDENT: OWN
// COUNSELLOR: ACTIVE ASSIGNED
// ======================================================

exports.getAllCounsellingRequests = async (req, res) => {
  try {
    const {
      status,
      priority,
      admissionLevel,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (req.user.role === "Student") {
      filter.student = req.user.id;
    } else if (isCounsellor(req.user.role)) {
      const assignments = await CounsellingAssignment.find({
        counsellor: req.user.id,
        status: "active",
      }).select("counsellingRequest");

      filter._id = {
        $in: assignments.map((item) => item.counsellingRequest),
      };
    } else if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view counselling requests.",
      });
    }

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid counselling request status.",
        });
      }

      filter.status = status;
    }

    if (priority) {
      if (!["low", "normal", "high"].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority.",
        });
      }

      filter.priority = priority;
    }

    if (admissionLevel) {
      if (!allowedLevels.includes(admissionLevel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid admission level.",
        });
      }

      filter.admissionLevel = admissionLevel;
    }

    if (search) {
      const safeSearch = String(search).trim().slice(0, 100);

      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ],
      }).select("_id");

      filter.$and = [
        {
          $or: [
            {
              requestNumber: {
                $regex: safeSearch,
                $options: "i",
              },
            },
            {
              student: {
                $in: matchingUsers.map((user) => user._id),
              },
            },
          ],
        },
      ];
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (currentPage - 1) * pageLimit;

    const [requests, total] = await Promise.all([
      CounsellingRequest.find(filter)
        .populate("student", "name email")
        .populate("preferredStreams", "name")
        .populate("preferredCourses", "name")
        .populate("entranceExams.exam", "name shortName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      CounsellingRequest.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Counselling requests fetched successfully.",
      data: requests,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    console.error("Get Counselling Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling requests.",
      error: error.message,
    });
  }
};

// ======================================================
// 3. GET LOGGED-IN STUDENT'S REQUESTS
// ======================================================

exports.getMyCounsellingRequests = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this endpoint.",
      });
    }

    const requests = await CounsellingRequest.find({
      student: req.user.id,
    })
      .populate("preferredStreams", "name")
      .populate("preferredCourses", "name")
      .populate("entranceExams.exam", "name shortName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Your counselling requests fetched successfully.",
      data: requests,
    });
  } catch (error) {
    console.error("Get My Counselling Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your counselling requests.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. GET COUNSELLING REQUEST BY ID
// ======================================================

exports.getCounsellingRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    const request = await CounsellingRequest.findById(id)
      .populate("student", "name email")
      .populate("preferredStreams", "name")
      .populate("preferredCourses", "name")
      .populate("entranceExams.exam", "name shortName");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found.",
      });
    }

    if (req.user.role === "Student") {
      if (
        !request.student ||
        request.student._id.toString() !== req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access another student's request.",
        });
      }
    } else if (isCounsellor(req.user.role)) {
      const assignment = await getActiveAssignment(id, req.user.id);

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "This request is not assigned to you.",
        });
      }
    } else if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this request.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Counselling request fetched successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Get Counselling Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling request.",
      error: error.message,
    });
  }
};

// ======================================================
// 5. UPDATE COUNSELLING REQUEST
// STUDENT: OWN REQUEST WHILE NEW
// ADMIN: ANY REQUEST
// ======================================================

exports.updateCounsellingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    const request = await CounsellingRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found.",
      });
    }

    const isStudent = req.user.role === "Student";

    if (isStudent) {
      if (request.student.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You cannot update another student's request.",
        });
      }

      if (request.status !== "new") {
        return res.status(400).json({
          success: false,
          message: "You can only update a new counselling request.",
        });
      }
    } else if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this request.",
      });
    }

    const allowedFields = [
      "academicYear",
      "admissionLevel",
      "preferredStreams",
      "preferredCourses",
      "preferredLocations",
      "budget",
      "entranceExams",
      "counsellingMode",
      "preferredTime",
    ];

    if (!isStudent) {
      allowedFields.push("priority", "source");
    }

    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;

      const value = req.body[field];

      if (field === "academicYear") {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({
            success: false,
            message: "Invalid academic year.",
          });
        }

        request.academicYear = value.trim();
      } else if (field === "admissionLevel") {
        if (!allowedLevels.includes(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid admission level.",
          });
        }

        request.admissionLevel = value;
      } else if (field === "preferredStreams" || field === "preferredCourses") {
        if (!validateIdArray(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        request[field] = value;
      } else if (field === "preferredLocations") {
        if (!validateLocations(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid preferred locations.",
          });
        }

        request.preferredLocations = value;
      } else if (field === "budget") {
        if (!validateBudget(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid budget details.",
          });
        }

        request.budget = value;
      } else if (field === "entranceExams") {
        if (!validateEntranceExams(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid entrance exam details.",
          });
        }

        request.entranceExams = value;
      } else if (field === "counsellingMode") {
        if (!allowedModes.includes(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid counselling mode.",
          });
        }

        request.counsellingMode = value;
      } else if (field === "preferredTime") {
        if (!validatePreferredTime(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid preferred time.",
          });
        }

        request.preferredTime = value;
      } else if (field === "priority") {
        if (!["low", "normal", "high"].includes(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid priority.",
          });
        }

        request.priority = value;
      } else if (field === "source") {
        if (
          !["website", "organic", "referral", "campaign", "college", "other"].includes(value)
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid request source.",
          });
        }

        request.source = value;
      }
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Counselling request updated successfully.",
      data: request,
    });
  } catch (error) {
    console.error("Update Counselling Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update counselling request.",
      error: error.message,
    });
  }
};

// ======================================================
// 6. UPDATE COUNSELLING REQUEST STATUS
// ADMIN ONLY
// ======================================================

exports.updateCounsellingRequestStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    if (!isAdmin(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin can update request status.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request status.",
      });
    }

    if (
      status === "cancelled" &&
      (typeof cancellationReason !== "string" ||
        !cancellationReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required.",
      });
    }

    await session.withTransaction(async () => {
      const request = await CounsellingRequest.findById(id).session(session);

      if (!request) {
        const error = new Error("Counselling request not found.");
        error.statusCode = 404;
        throw error;
      }

      if (status === "assigned") {
        const activeAssignment = await CounsellingAssignment.findOne({
          counsellingRequest: id,
          status: "active",
        }).session(session);

        if (!activeAssignment) {
          const error = new Error(
            "Assign a counsellor before setting this status."
          );
          error.statusCode = 400;
          throw error;
        }
      }

      if (terminalStatuses.includes(status)) {
        const now = new Date();

        await CounsellingAssignment.updateMany(
          {
            counsellingRequest: id,
            status: "active",
          },
          {
            $set: {
              status: "completed",
              endedAt: now,
            },
          },
          { session }
        );

        await Appointment.updateMany(
          {
            counsellingRequest: id,
            status: { $in: ["scheduled", "confirmed"] },
          },
          {
            $set: {
              status: "cancelled",
              cancellationReason:
                status === "cancelled"
                  ? cancellationReason.trim()
                  : "Counselling request closed.",
            },
          },
          { session }
        );

        await FollowUp.updateMany(
          {
            counsellingRequest: id,
            status: { $in: ["pending", "overdue"] },
          },
          {
            $set: {
              status: "cancelled",
            },
          },
          { session }
        );
      }

      request.status = status;

      if (terminalStatuses.includes(status)) {
        request.closedAt = new Date();
      } else {
        request.closedAt = undefined;
      }

      request.cancellationReason =
        status === "cancelled"
          ? cancellationReason.trim()
          : undefined;

      await request.save({ session });
    });

    const updatedRequest = await CounsellingRequest.findById(id);

    return res.status(200).json({
      success: true,
      message: "Counselling request status updated successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update Counselling Status Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update counselling request.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ======================================================
// 7. DELETE COUNSELLING REQUEST
// SUPER ADMIN ONLY
// ======================================================

exports.deleteCounsellingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    if (req.user.role !== "Super Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can delete counselling requests.",
      });
    }

    const request = await CounsellingRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found.",
      });
    }

    const [
      relatedAssignment,
      relatedAppointment,
      relatedSession,
      relatedNote,
      relatedFollowUp,
    ] = await Promise.all([
      CounsellingAssignment.exists({ counsellingRequest: id }),
      Appointment.exists({ counsellingRequest: id }),
      CounsellingSession.exists({ counsellingRequest: id }),
      CounsellingNote.exists({ counsellingRequest: id }),
      FollowUp.exists({ counsellingRequest: id }),
    ]);

    if (
      relatedAssignment ||
      relatedAppointment ||
      relatedSession ||
      relatedNote ||
      relatedFollowUp
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This request has related counselling records and cannot be deleted.",
      });
    }

    await CounsellingRequest.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Counselling request deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Counselling Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete counselling request.",
      error: error.message,
    });
  }
};