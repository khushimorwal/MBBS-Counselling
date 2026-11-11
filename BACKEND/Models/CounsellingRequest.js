const mongoose = require("mongoose");

const counsellingRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    admissionLevel: {
      type: String,
      enum: ["UG", "PG", "Diploma", "Doctorate", "Other"],
      required: true,
    },

    preferredStreams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stream",
      },
    ],

    preferredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    preferredLocations: [
      {
        city: String,
        state: String,
        country: String,
      },
    ],

    budget: {
      min: {
        type: Number,
        min: 0,
      },

      max: {
        type: Number,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },
    },

    entranceExams: [
      {
        exam: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EntranceExam",
        },

        score: Number,
        percentile: Number,
        rank: Number,
        year: Number,
      },
    ],

    counsellingMode: {
      type: String,
      enum: ["phone", "video", "in_person", "chat"],
      default: "phone",
    },

    preferredTime: {
      date: Date,

      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },
    },

    status: {
      type: String,
      enum: [
        "new",
        "assigned",
        "contact_pending",
        "in_progress",
        "recommendations_shared",
        "converted",
        "closed",
        "cancelled",
      ],
      default: "new",
      index: true,
    },

    workflowStages: {
  type: [
    {
      id: {
        type: String,
        enum: [
          "registration",
          "choice_filling",
          "choice_locking",
          "seat_allotment",
          "document_verification",
          "admission_confirmation",
        ],
        required: true,
      },

      status: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending",
      },

      completedAt: {
        type: Date,
        default: null,
      },

      remarks: {
        type: String,
        default: "",
      },
    },
  ],

  default: () => [
    { id: "registration", status: "completed", completedAt: new Date() },
    { id: "choice_filling", status: "pending" },
    { id: "choice_locking", status: "pending" },
    { id: "seat_allotment", status: "pending" },
    { id: "document_verification", status: "pending" },
    { id: "admission_confirmation", status: "pending" },
  ],
},



    source: {
      type: String,
      enum: [
        "website",
        "organic",
        "referral",
        "campaign",
        "college",
        "other",
      ],
      default: "website",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    closedAt: Date,

    cancellationReason: String,
  },

  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.CounsellingRequest ||
  mongoose.model("CounsellingRequest", counsellingRequestSchema);