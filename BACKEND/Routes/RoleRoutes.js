const express = require("express");
const router = express.Router();

const {
createRole,
getRole,
getRoleById,
updateRole,
deleteRole,
} = require("../CONTROLLERS/RoleController");

const Auth = require("../Auth");

// Create Role
router.post("/create", Auth, requireSuperAdmin, createRole);

// Get all Roles
router.get("/get-role", Auth, requireSuperAdmin, getRole);

// Get Role by ID
router.get("/get-role-id/:id", Auth, requireSuperAdmin, getRoleById);

// Update Role
router.put("/update/:id", Auth, requireSuperAdmin, updateRole);

// Delete Role
router.delete("/delete/:id", Auth, requireSuperAdmin, deleteRole);

// Only Super Admin can manage roles and permissions
function requireSuperAdmin(req, res, next) {
if (req.user?.role !== "Super Admin") {
return res.status(403).json({
status: false,
message: "Only Super Admin can manage roles and permissions",
});
}

next();
}

module.exports = router;
