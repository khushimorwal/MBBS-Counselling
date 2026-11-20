require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");
const Role = require("../Models/Role");
const { User } = require("../Models/loginSchma");

const createSuperAdmin = async () => {
  try {
    // Check required environment variables.
    const name = process.env.SUPER_ADMIN_NAME;
const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;


    

    if (!name || !email || !password) {
      throw new Error("Super Admin credentials missing in .env");
    }

    // Connect to MongoDB.
    await connectDB;

    const normalizedEmail = email.trim().toLowerCase();

    // Find existing Super Admin role.
    let superAdminRole = await Role.findOne({
      role: "Super Admin",
    });

    // Create Super Admin role if it does not exist.
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        role: "Super Admin",
        permissions: [],
        isAssigned: true,
      });

      console.log("Super Admin Role created successfully");
    }

    // Check whether a user already has this role.
    const existingSuperAdmin = await User.findOne({
      roleId: superAdminRole._id,
    });

    
    if (existingSuperAdmin) {
  const hashedPassword = await bcrypt.hash(password, 10);

  existingSuperAdmin.name = name.trim();
  existingSuperAdmin.email = normalizedEmail;
  existingSuperAdmin.password = hashedPassword;

  await existingSuperAdmin.save();

  console.log("Super Admin credentials updated successfully");
  return;
}

    // Check whether email is already registered.
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new Error("This email is already registered with another role");
    }

    // Hash password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Super Admin user.
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roleId: superAdminRole._id,
    });

    console.log("Super Admin User created successfully");
    console.log("Email:", normalizedEmail);
    console.log("Role ID:", superAdminRole._id);

  } catch (error) {
    console.error("Super Admin Setup Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

createSuperAdmin();

