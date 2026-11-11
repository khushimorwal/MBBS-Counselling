const express = require("express");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { User, Verification } = require("../Models/loginSchma");
const Role = require("../Models/Role");

const rateLimit = require("express-rate-limit");

const router = express.Router();

// Brute-force protection for credential and OTP endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});
router.use(["/login", "/forgotpassword", "/verifyforgototp", "/resetpassword"], authLimiter);

// ======================================================
// EMAIL TRANSPORTER
// Keep email credentials in .env
// ======================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// LOGIN API
// POST /auth/login (if mounted at /auth)
// ======================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (typeof user.password !== "string" || !user.password) {
      return res.status(500).json({
        success: false,
        message: "User password is not configured correctly",
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.roleId) {
      return res.status(403).json({
        success: false,
        message: "No role is assigned to this user",
      });
    }

    const role = await Role.findById(user.roleId);

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Assigned role was not found",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in .env");
    }

    const token = jwt.sign(
      {
        userId: user._id,
        roleId: role._id,
        role: role.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roleId: role._id,
        role: role.role,
        permissions: role.permissions || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
}); // IMPORTANT: Login route is now correctly closed.

// ======================================================
// SIGNUP API
// POST /auth/signup (if mounted at /auth)
// Creates a user with the Student role.
// ======================================================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const studentRole = await Role.findOne({
      role: "Student",
    });

    if (!studentRole) {
      return res.status(500).json({
        success: false,
        message: "Student role not found. Create the Student role first.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roleId: studentRole._id,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: studentRole.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
});

// ======================================================
// FORGOT PASSWORD API
// POST /auth/forgotpassword
// Generates and emails a six-digit OTP.
// ======================================================
router.post("/forgotpassword", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials are missing in .env");

      return res.status(500).json({
        success: false,
        message: "Email service is not configured",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Remove previous OTP records for this email.
    await Verification.deleteMany({
      email: normalizedEmail,
    });

    await Verification.create({
      email: normalizedEmail,
      otp,
      verified: false,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP could not be sent",
    });
  }
});

// ======================================================
// VERIFY FORGOT PASSWORD OTP API
// POST /auth/verifyforgototp
// ======================================================
router.post("/verifyforgototp", async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      otp === undefined ||
      otp === null ||
      !String(otp).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const verification = await Verification.findOne({
      email: normalizedEmail,
      otp: String(otp).trim(),
      verified: false,
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const difference = Date.now() - new Date(verification.createdAt).getTime();

    if (
      !Number.isFinite(difference) ||
      difference < 0 ||
      difference > 5 * 60 * 1000
    ) {
      await Verification.deleteMany({
        email: normalizedEmail,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Request a new OTP.",
      });
    }

    verification.verified = true;
    await verification.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});

// ======================================================
// RESET PASSWORD API
// POST /auth/resetpassword
// ======================================================
router.post("/resetpassword", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and new password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const verification = await Verification.findOne({
      email: normalizedEmail,
      verified: true,
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    const difference = Date.now() - new Date(verification.createdAt).getTime();

    if (
      !Number.isFinite(difference) ||
      difference < 0 ||
      difference > 5 * 60 * 1000
    ) {
      await Verification.deleteMany({
        email: normalizedEmail,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Request a new OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { password: hashedPassword } },
      { new: true, runValidators: true },
    );

    if (!user) {
      await Verification.deleteMany({
        email: normalizedEmail,
      });

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the verified OTP after a successful password reset.
    await Verification.deleteMany({
      email: normalizedEmail,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
});

module.exports = router;
