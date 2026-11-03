const mongoose = require("mongoose");

// ======================================================
// USER SCHEMA
// Stores login credentials and the role assigned to a user.
// ======================================================
const userSchema = new mongoose.Schema(
  {
    // User's registered email address.

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

    // Store only the bcrypt-hashed password, never plain text.
    password: {
      type: String,
      required: true,
    },

    // Reference to the user's assigned role in the Role collection.
    // Examples: SuperAdmin, Admin, Student.
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  { timestamps: true },
);

// ======================================================
// EMAIL VERIFICATION SCHEMA
// Stores OTP information for password-reset verification.
// ======================================================
const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  // OTP is stored as a string to preserve leading zeroes.
  otp: {
    type: String,
    required: true,
  },

  // True once the OTP has been successfully verified.
  verified: {
    type: Boolean,
    default: false,
  },

  // Used to check whether the OTP has expired.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose models.
const User = mongoose.model("User", userSchema);
const Verification = mongoose.model("Verification", verificationSchema);

// Export both models for use in routes.
module.exports = { User, Verification };
