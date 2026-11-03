const bcrypt = require("bcrypt");
const Role = require("../Models/Role");
const User = require("../Models/User");
const Students = require("../Models/StudentSchma");
const jwt = require("jsonwebtoken");



// ================= CREATE USER API =================
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !role.trim()
    ) {
      return res.status(400).json({
        status: false,
        message: "Name, email, password and role are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        status: false,
        message: "Please enter a valid email",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Validate role
    const allowedRoles = ["Student", "Admin", "Super Admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "User already exists",
      });
    }

    // Find role in Role collection
    const selectedRole = await Role.findOne({ role });

    if (!selectedRole) {
      return res.status(404).json({
        status: false,
        message: `${role} role not found`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using the active schema fields
    const newUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: selectedRole._id,
    });

    return res.status(201).json({
      status: true,
      message: `${role} user created successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: role,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "User already exists",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Server error while creating user",
    });
  }
};

// ================= VERIFY EMAIL API =================
const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let existingUser = await User.findOne({
      email: normalizedEmail,
    });

    // If email is not found in User, check Students
    if (!existingUser) {
      existingUser = await Students.findOne({
        email: normalizedEmail,
      });
    }

    if (!existingUser) {
      return res.status(404).json({
        status: false,
        message: "Email not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Email is verified",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while verifying email",
    });
  }
};


 // ================= LOGIN USER API =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validate required fields
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({
      email: normalizedEmail,
    }).populate("roleId");

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }



    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    
    // Generate JWT token after successful login
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        roleId: user.roleId._id.toString(),
        role: user.roleId.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );


    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.roleId?.role,
      },
    });
  } 
  catch (error) {
  console.error("Login Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while logging in",
    });
  }
};


module.exports = {
  createUser,
  verifyEmail,
  loginUser
};
