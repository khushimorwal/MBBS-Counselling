const SuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized. Please login first.",
      });
    }

    if (req.user.role !== "Super Admin") {
      return res.status(403).json({
        status: false,
        message: "Access denied. Super Admin only.",
      });
    }

    next();
  } catch (error) {
    console.error("Super Admin middleware error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = SuperAdmin;
