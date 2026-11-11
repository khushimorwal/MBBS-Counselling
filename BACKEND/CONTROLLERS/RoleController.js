const mongoose = require("mongoose");
const Role = require("../Models/Role");

// Convert permissions into a string array
const convertPermissions = (permissions) => {
  if (Array.isArray(permissions)) {
    return [
      ...new Set(
        permissions.filter((permission) => typeof permission === "string"),
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

// CREATE ROLE
const createRole = async (req, res) => {
  try {
    const { role, permissions } = req.body || {};

    if (!role || typeof role !== "string" || !role.trim()) {
      return res.status(400).json({
        status: false,
        message: "Role name is required",
      });
    }

    if (permissions === undefined || permissions === null) {
      return res.status(400).json({
        status: false,
        message: "Permissions are required",
      });
    }

    const roleName = role.trim();

    if (roleName.toLowerCase() === "super admin") {
      return res.status(400).json({
        status: false,
        message: "Super Admin role already exists",
      });
    }

    const existingRoles = await Role.find({});

    const existingRole = existingRoles.find(
      (item) => item.role.toLowerCase() === roleName.toLowerCase(),
    );

    const selectedPermissions = convertPermissions(permissions);

    if (existingRole) {
      if (existingRole.isAssigned) {
        return res.status(400).json({
          status: false,
          message: "This role already exists",
        });
      }

      existingRole.permissions = selectedPermissions;

      if (typeof req.body.isAssigned === "boolean") {
        existingRole.isAssigned = req.body.isAssigned;
      } else {
        existingRole.isAssigned = true;
      }

      await existingRole.save();

      return res.status(200).json({
        status: true,
        message: "Role activated successfully",
        role: existingRole,
      });
    }

    const newRole = new Role({
      role: roleName,
      permissions: selectedPermissions,
      isAssigned: true,
    });

    await newRole.save();

    return res.status(201).json({
      status: true,
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    console.error("Create Role Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while creating role",
    });
  }
};

// GET ALL ROLES
const getRole = async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ role: 1 });

    return res.status(200).json({
      status: true,
      role: roles,
    });
  } catch (error) {
    console.error("Get Role Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while fetching roles",
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
    console.error("Get Role By ID Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while fetching role",
    });
  }
};

// UPDATE ROLE PERMISSIONS
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, isAssigned } = req.body || {};

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

    if (existingRole.role === "Super Admin") {
      return res.status(403).json({
        status: false,
        message: "Super Admin cannot be modified",
      });
    }

    // Update permissions only when provided
    if (permissions !== undefined) {
      existingRole.permissions = convertPermissions(permissions);
    }

    // Update status only when provided
    if (typeof isAssigned === "boolean") {
      existingRole.isAssigned = isAssigned;
    }

    await existingRole.save();

    return res.status(200).json({
      status: true,
      message: "Role updated successfully",
      role: existingRole,
    });
  } catch (error) {
    console.error("Update Role Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while updating role",
    });
  }
};

// SOFT DELETE ROLE
const deleteRole = async (req, res) => {
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

    if (role.role === "Super Admin") {
      return res.status(403).json({
        status: false,
        message: "Super Admin cannot be removed",
      });
    }

    role.isAssigned = false;
    await role.save();

    return res.status(200).json({
      status: true,
      message: "Role removed successfully",
    });
  } catch (error) {
    console.error("Delete Role Error:", error);

    return res.status(500).json({
      status: false,
      message: "Server error while removing role",
    });
  }
};

module.exports = {
  createRole,
  getRole,
  getRoleById,
  updateRole,
  deleteRole,
};
