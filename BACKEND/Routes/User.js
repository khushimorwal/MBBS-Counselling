const express = require("express");
const router = express.Router();

const {
  createUser,
  verifyEmail,
  loginUser,
  getAllCounsellors
} = require("../CONTROLLERS/UserController");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// Protected test route
router.get("/test", Auth, (req, res) => {
  res.json({
    message: "User route working",
    user: req.user,
  });
});

// Get All Counsellors
router.get(
  "/counsellors",
  Auth,
  Permission("users.view"),
  getAllCounsellors
);


// Public authentication routes
router.post("/create-user", createUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);

// Protected user creation route
router.post(
  "/admin/create-user",
  Auth,
  Permission("users.add"),
  createUser
);

module.exports = router;