const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    permissions: {
      type: [String],
      default: [],
    },

    isAssigned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);

