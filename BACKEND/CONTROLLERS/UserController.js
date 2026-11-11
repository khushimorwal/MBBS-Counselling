const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Role = require("../Models/Role");
const User = require("../Models/User");
const Students = require("../Models/StudentSchma");

// ================= CREATE USER API =================
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: false,
        message: "Name, email and password are required",
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

    // Identify public signup or protected user creation
    const isAdminRoute = Boolean(req.user);

    let selectedRoleName;

    if (!isAdminRoute) {
      // Public signup: Student only
      selectedRoleName = "Student";
    } else {
      const currentRole = req.user.role;

      if (!["Admin", "Super Admin"].includes(currentRole)) {
        return res.status(403).json({
          status: false,
          message: "You are not allowed to create users",
        });
      }

      if (typeof role !== "string" || !role.trim()) {
        return res.status(400).json({
          status: false,
          message: "Role is required",
        });
      }

      selectedRoleName = role.trim();

      // Admin cannot create another Admin or Super Admin
      if (currentRole === "Admin") {
        if (!["Student", "Counsellor"].includes(selectedRoleName)) {
          return res.status(403).json({
            status: false,
            message: "Admin can create only Student or Counsellor",
          });
        }
      }

      // Super Admin can create these roles
      if (
        currentRole === "Super Admin" &&
        !["Student", "Admin", "Counsellor"].includes(selectedRoleName)
      ) {
        return res.status(400).json({
          status: false,
          message: "Invalid role",
        });
      }
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
    const selectedRole = await Role.findOne({
      role: selectedRoleName,
    });

    if (!selectedRole) {
      return res.status(404).json({
        status: false,
        message: `${selectedRoleName} role not found. Please create the role first.`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: selectedRole._id,
    });

    return res.status(201).json({
      status: true,
      message: `${selectedRoleName} user created successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: selectedRoleName,
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

    // Find user and populate role
    const user = await User.findOne({
      email: normalizedEmail,
    }).populate("roleId");

    if (!user || !user.roleId) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
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

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");

      return res.status(500).json({
        status: false,
        message: "Authentication configuration error",
      });
    }

    // Generate JWT token
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
        role: user.roleId.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while logging in",
    });
  }
};


// ================= GET ALL COUNSELLORS API =================
const getAllCounsellors = async (req, res) => {
  try {
    // Find Counsellor role
    const counsellorRole = await Role.findOne({
      role: "Counsellor",
    });

    if (!counsellorRole) {
      return res.status(404).json({
        status: false,
        message: "Counsellor role not found",
      });
    }

    // Find users having Counsellor role
    const counsellors = await User.find({
      roleId: counsellorRole._id,
    })
      .select("_id name email")
      .sort({ name: 1 });

    return res.status(200).json({
      status: true,
      message: "Counsellors fetched successfully",
      data: counsellors,
    });

  } catch (error) {
    console.error("Get Counsellors Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while fetching counsellors",
    });
  }
};

module.exports = {
  createUser,
  verifyEmail,
  loginUser,
  getAllCounsellors
};
