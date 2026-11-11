const mongoose = require("mongoose");

const entranceExamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    shortName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    conductingBody: {
      type: String,
      trim: true,
    },

    examLevel: {
      type: String,
      enum: ["National", "State", "University"],
      default: "National",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.EntranceExam ||
  mongoose.model("EntranceExam", entranceExamSchema);