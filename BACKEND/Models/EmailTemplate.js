const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
      trim: true,
    },

    Description: {
      type: String,
      required: true,
      trim: true,
    },

    Content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmailTemplate",
  emailTemplateSchema
);
