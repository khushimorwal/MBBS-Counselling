const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    dueAt: {
      type: Date,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["call", "email", "document", "appointment", "other"],
      default: "call",
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "overdue"],
      default: "pending",
      index: true,
    },

    completedAt: {
      type: Date,
    },

    outcome: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUpSchema);