
const jwt = require("jsonwebtoken");
const User = require("./Models/User");
const Role = require("./Models/Role");

const Auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    // Find user's role
    const role = await Role.findById(user.roleId);

    if (!role) {
      return res.status(403).json({
        status: false,
        message: "Role not found",
      });
    }

    
    // Check whether user's role is active
if (!role.isAssigned && role.role !== "Super Admin") {
  return res.status(403).json({
    status: false,
    message: "Your role is inactive",
  });
}


    // Store user information
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: role.role,
      permissions: role.permissions || [],
    };

    return next();

  } catch (error) {
    console.log("Authentication Error:", error.message);

    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = Auth;
