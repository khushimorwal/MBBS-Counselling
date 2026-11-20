const mongoose = require("mongoose");

const collegeRecommendationSchema = new mongoose.Schema(
  {
    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
      unique: true,
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

    colleges: [
      {
        college: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "College",
          required: true,
        },

        priority: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],

    counsellorNote: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "shared"],
      default: "draft",
    },

    sharedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CollegeRecommendation",
  collegeRecommendationSchema
);