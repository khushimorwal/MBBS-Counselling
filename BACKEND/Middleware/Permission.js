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

      // Super Admin has full access
      if (role === "Super Admin") {
        return next();
      }

      // Student can Add and View only in Students module
      if (role === "Student") {
        if (module === "students" && ["add", "view"].includes(action)) {
          return next();
        }

        // Student can only View other modules
        if (action === "view" && module !== "roles") {
          return next();
        }

        return res.status(403).json({
          status: false,
          message: "You do not have permission to perform this action",
        });
      }

      // Admin can Add, Edit and View, but cannot Delete
      if (role === "Admin") {
        if (action === "delete") {
          return res.status(403).json({
            status: false,
            message: "Admin cannot delete records",
          });
        }
      }

      // Check permissions assigned to the role
      const allowed = req.user.permissions?.[module]?.[action] === true;

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

