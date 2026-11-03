const express = require("express");
const router = express.Router();

const {
createUser,
verifyEmail,
loginUser,
} = require("../CONTROLLERS/UserController");

const Auth = require("../Auth");

// Protected test route
router.get("/test", Auth, (req, res) => {
res.json({
message: "User route working",
user: req.user,
});
});

// Public authentication routes
router.post("/create-user", createUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);

module.exports = router;
