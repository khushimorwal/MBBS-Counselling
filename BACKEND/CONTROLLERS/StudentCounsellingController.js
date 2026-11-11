
const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const Appointment = require("../Models/Appointment");
const CounsellingSession = require("../Models/CounsellingSession");
const CounsellingNote = require("../Models/CounsellingNote");
const FollowUp = require("../Models/FollowUp");

// Get student's complete counselling details
exports.getMyCounsellingStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch student's counselling requests
    const requests = await CounsellingRequest.find({
      student: studentId,
    })
      .populate("preferredStreams", "name")
      .populate("preferredCourses", "name")
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(200).json({
        success: true,
        message: "No counselling requests found.",
        counselling: [],
      });
    }

    const counsellingData = await Promise.all(
      requests.map(async (request) => {
        const requestId = request._id;

        // Active counsellor assignment
        const activeAssignment = await CounsellingAssignment.findOne({
          counsellingRequest: requestId,
          status: "active",
        })
          .populate("counsellor", "name email")
          .populate("assignedBy", "name email");

        // Appointment history
        const appointments = await Appointment.find({
          counsellingRequest: requestId,
          student: studentId,
        })
          .populate("counsellor", "name email")
          .sort({ scheduledStart: -1 });

        // Counselling session history
        const sessions = await CounsellingSession.find({
          counsellingRequest: requestId,
          student: studentId,
        })
          .populate("counsellor", "name email")
          .populate("appointment")
          .sort({ createdAt: -1 });

        // Student-visible counselling notes only
        const notes = await CounsellingNote.find({
          counsellingRequest: requestId,
          visibility: "student_visible",
        })
          .populate("author", "name")
          .sort({ createdAt: -1 });

        // Student's follow-ups
        const followUps = await FollowUp.find({
          counsellingRequest: requestId,
          student: studentId,
        })
          .populate("assignedTo", "name email")
          .sort({ dueAt: 1 });

        // Next upcoming appointment
        const nextAppointment = await Appointment.findOne({
          counsellingRequest: requestId,
          student: studentId,
          scheduledStart: { $gte: new Date() },
          status: { $in: ["scheduled", "confirmed"] },
        })
          .populate("counsellor", "name email")
          .sort({ scheduledStart: 1 });

        // Count completed sessions
        const completedSessions = sessions.filter(
          (session) => session.status === "completed"
        ).length;

        return {
          request,
          status: request.status,

          // Workflow stages
          workflowStages: request.workflowStages,

          counsellor: activeAssignment
            ? activeAssignment.counsellor
            : null,

          assignment: activeAssignment,

          appointments,

          nextAppointment,

          sessions,

          totalSessions: sessions.length,

          completedSessions,

          notes,

          followUps,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Counselling status fetched successfully.",
      totalRequests: counsellingData.length,
      counselling: counsellingData,
    });
  } catch (error) {
    console.error("Student Counselling Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling status.",
      error: error.message,
    });
  }
};
