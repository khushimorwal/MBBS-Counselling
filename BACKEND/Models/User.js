
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    otp: {
      type: String,
    },

    otpExpiresAt: {
      type: Date,
    },

    password: {
      type: String,
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

activePackage: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Package",
  default: null,
},

    planStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    planActivatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
