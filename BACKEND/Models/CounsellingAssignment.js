const mongoose = require("mongoose");

const counsellingAssignmentSchema = new mongoose.Schema(
  {
    // Counselling request being assigned.
    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
      index: true,
    },

    // Counsellor receiving the assignment.
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Admin who assigned the request.
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    assignmentType: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },

    status: {
      type: String,
      enum: ["active", "reassigned", "completed"],
      default: "active",
    },

    // New counsellor, if the request is reassigned.
    reassignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reassignmentReason: {
      type: String,
      trim: true,
    },

    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.CounsellingAssignment ||
  mongoose.model("CounsellingAssignment", counsellingAssignmentSchema);