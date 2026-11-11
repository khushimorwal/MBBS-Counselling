
const Permission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const [module, action] = requiredPermission.split(".");
      const role = req.user.role;

      // Super Admin - Full Access
      if (role === "Super Admin") {
        return next();
      }

     // Student Permissions
if (role === "Student") {
  if (
    (module === "students" && ["add", "view"].includes(action)) ||
    (module === "applications" && ["add", "view"].includes(action))
  ) {
    return next();
  }

  return res.status(403).json({
    status: false,
    message: "You do not have permission to perform this action",
  });
}

      // Admin cannot Delete
      if (role === "Admin" && action === "delete") {
        return res.status(403).json({
          status: false,
          message: "Admin cannot delete records",
        });
      }

      // Check permissions assigned to Admin
      const allowed = req.user.permissions?.includes(
        `${module}_${action}`
      );

      if (!allowed) {
        return res.status(403).json({
          status: false,
          message: "Permission denied",
        });
      }

      return next();

    } catch (error) {
      console.error("Permission middleware error:", error);

      return res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  };
};

module.exports = Permission;
