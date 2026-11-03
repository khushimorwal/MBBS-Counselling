const mongoose = require("mongoose");
const Role = require("../Models/Role");

const allowedRoles = ["Admin", "Student"];

// Convert permissions into a string array
const convertPermissions = (permissions) => {
  if (Array.isArray(permissions)) {
    return [
      ...new Set(
        permissions.filter(
          (permission) => typeof permission === "string"
        )
      ),
    ];
  }

  const permissionArray = [];

  if (
    permissions &&
    typeof permissions === "object" &&
    !Array.isArray(permissions)
  ) {
    for (const [module, actions] of Object.entries(permissions)) {
      if (!actions || typeof actions !== "object") continue;

      for (const [action, selected] of Object.entries(actions)) {
        if (
          ["view", "add", "edit", "delete"].includes(action) &&
          selected === true
        ) {
          permissionArray.push(`${module}_${action}`);
        }
      }
    }
  }

  return [...new Set(permissionArray)];
};

// SAVE PERMISSIONS TO AN EXISTING ROLE
const createRole = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Only Admin or Student role is allowed",
      });
    }

    if (permissions === undefined || permissions === null) {
      return res.status(400).json({
        status: false,
        message: "Permissions are required",
      });
    }

    const existingRole = await Role.findOne({ role });

    if (!existingRole) {
      return res.status(404).json({
        status: false,
        message: `${role} role was not found in the database`,
      });
    }

    const selectedPermissions = convertPermissions(permissions);

    if (selectedPermissions.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Select at least one permission",
      });
    }

    existingRole.permissions = selectedPermissions;
    existingRole.isAssigned = true;

    await existingRole.save();

    return res.status(200).json({
      status: true,
      message: "Permissions saved successfully",
      role: existingRole,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// GET ALL THREE EXISTING ROLES
const getRole = async (req, res) => {
  try {
    const roles = await Role.find({
      role: { $in: ["Super Admin", "Admin", "Student"] },
    }).sort({ role: 1 });

    return res.status(200).json({
      status: true,
      role: roles,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// GET ROLE BY ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      status: true,
      role,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// UPDATE PERMISSIONS FOR AN EXISTING ROLE
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid role ID",
      });
    }

    const existingRole = await Role.findById(id);

    if (!existingRole) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    if (!allowedRoles.includes(existingRole.role)) {
      return res.status(403).json({
        status: false,
        message: "Only Admin and Student permissions can be updated here",
      });
    }

    if (permissions === undefined || permissions === null) {
      return res.status(400).json({
        status: false,
        message: "Permissions are required",
      });
    }

    const selectedPermissions = convertPermissions(permissions);

    if (selectedPermissions.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Select at least one permission",
      });
    }

    existingRole.permissions = selectedPermissions;
    existingRole.isAssigned = true;

    await existingRole.save();

    return res.status(200).json({
      status: true,
      message: "Permissions saved successfully",
      role: existingRole,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ROLES CANNOT BE DELETED HERE
const deleteRole = async (req, res) => {
  return res.status(403).json({
    status: false,
    message: "Admin and Student roles cannot be deleted",
  });
};

module.exports = {
  createRole,
  getRole,
  getRoleById,
  updateRole,
  deleteRole,
};

