const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicationId: {
      type: String,
      unique: true,
      required: true,
    },

    collegeName: {
      type: String,
      required: true,
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
    },

    round: {
      type: String,
      default: "Round 1",
    },

    status: {
      type: String,
      enum: [
        "Submitted",
        "Pending",
        "Under Review",
        "Approved",
        "Rejected",
      ],
      default: "Submitted",
    },

    remarks: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);