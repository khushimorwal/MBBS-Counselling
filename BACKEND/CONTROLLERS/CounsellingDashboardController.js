
const mongoose = require("mongoose");

const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const Appointment = require("../Models/Appointment");
const FollowUp = require("../Models/FollowUp");
const User = require("../Models/User");
const Role = require("../Models/Role");

const isAdmin = (role) =>
  role === "Admin" || role === "Super Admin";

exports.getCounsellingDashboard = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (
      !isAdmin(userRole) &&
      userRole !== "Counsellor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    let requestFilter = {};
    let assignmentFilter = {};
    let appointmentFilter = {};
    let followUpFilter = {};

    // Counsellor ko sirf apna assigned data milega.
    if (userRole === "Counsellor") {
      const activeAssignments = await CounsellingAssignment.find({
        counsellor: userId,
        status: "active",
      }).select("counsellingRequest");

      const requestIds = activeAssignments.map(
        (assignment) => assignment.counsellingRequest
      );

      requestFilter = {
        _id: { $in: requestIds },
      };

      assignmentFilter = {
        counsellor: userId,
        status: "active",
      };

      appointmentFilter = {
        counsellor: userId,
      };

      followUpFilter = {
        assignedTo: userId,
      };
    }

    const [
      totalRequests,
      newRequests,
      assignedRequests,
      inProgressRequests,
      completedRequests,
      convertedRequests,
      totalAssignments,
      todayAppointments,
      upcomingAppointments,
      pendingFollowUps,
      overdueFollowUps,
      totalCounsellors,
    ] = await Promise.all([
      CounsellingRequest.countDocuments(requestFilter),

      CounsellingRequest.countDocuments({
        ...requestFilter,
        status: "new",
      }),

      CounsellingRequest.countDocuments({
        ...requestFilter,
        status: "assigned",
      }),

      CounsellingRequest.countDocuments({
        ...requestFilter,
        status: "in_progress",
      }),

      CounsellingRequest.countDocuments({
        ...requestFilter,
        status: "closed",
      }),

      CounsellingRequest.countDocuments({
        ...requestFilter,
        status: "converted",
      }),

      CounsellingAssignment.countDocuments(assignmentFilter),

      Appointment.countDocuments({
        ...appointmentFilter,
        scheduledStart: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
        status: { $in: ["scheduled", "confirmed"] },
      }),

      Appointment.countDocuments({
  ...appointmentFilter,
  scheduledStart: { $gte: new Date() },
  scheduledEnd: { $gt: new Date() },
  status: { $in: ["scheduled", "confirmed"] },
}),

      FollowUp.countDocuments({
        ...followUpFilter,
        status: "pending",
      }),

      FollowUp.countDocuments({
        ...followUpFilter,
        status: "overdue",
      }),

      isAdmin(userRole)
        ? (async () => {
            const counsellorRole = await Role.findOne({
              role: "Counsellor",
            });

            if (!counsellorRole) return 0;

            return User.countDocuments({
              roleId: counsellorRole._id,
            });
          })()
        : Promise.resolve(null),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalRequests,
        newRequests,
        assignedRequests,
        inProgressRequests,
        completedRequests,
        convertedRequests,
        totalAssignments,
        todayAppointments,
        upcomingAppointments,
        pendingFollowUps,
        overdueFollowUps,
        totalCounsellors,
      },
    });
  } catch (error) {
    console.error("Counselling Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling dashboard.",
      error: error.message,
    });
  }
};
