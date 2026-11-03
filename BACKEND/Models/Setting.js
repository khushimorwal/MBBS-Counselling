const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    portalName: {
      type: String,
      default: "MBBS Counselling",
    },

    portalDescription: {
      type: String,
      default: "Medical admission & counselling management",
    },

    supportEmail: {
      type: String,
      default: "",
    },

    supportPhone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    websiteUrl: {
      type: String,
      default: "",
    },

    academicSession: {
      type: String,
      default: "2026-27",
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);