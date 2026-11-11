const mongoose = require("mongoose");

const counsellingSessionSchema = new mongoose.Schema(
  {
    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
      index: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionNumber: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["initial", "follow_up", "admission_guidance", "other"],
      default: "initial",
    },

    startedAt: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },

    durationMinutes: {
      type: Number,
    },

    mode: {
      type: String,
      enum: ["phone", "video", "in_person", "chat"],
      required: true,
    },

    outcome: {
      type: String,
      enum: [
        "counselling_completed",
        "follow_up_required",
        "recommendations_needed",
        "student_unreachable",
        "student_not_interested",
      ],
    },

    studentQuestions: {
      type: [String],
    },

    nextAction: {
      type: String,
    },

    nextFollowUpAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed", "cancelled"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CounsellingSession",
  counsellingSessionSchema
);