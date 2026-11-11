// Load environment variables from the .env file.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const superAdmin = require("./Middleware/SuperAdmin");

// Import application configurations.
const cloudinary = require("./config/cloudnary");
const connectDB = require("./config/db");
const startFollowUpScheduler = require("./config/FollowUpScheduler");

// Import authentication middleware.
const auth = require("./Auth");

// Import API route modules.
const loginRoutes = require("./Routes/login");
const studentRoutes = require("./Routes/StudentRoute");
const roleRoutes = require("./Routes/RoleRoutes");
const collegeRoutes = require("./Routes/College");
const universityRoutes = require("./Routes/University");
const streamRoutes = require("./Routes/Stream");
const degreeRoutes = require("./Routes/Degree");
const courseRoutes = require("./Routes/Course");
const specializationRoutes = require("./Routes/SpecializationRoute");
const emailTemplateRoutes = require("./Routes/EmailTemplateRoute");
const userRoutes = require("./Routes/User");
const contactRoutes = require("./Routes/ContactRoute");
const bulkStudentRoutes = require("./Routes/BulkstudentRoutes");
const settingsRoutes = require("./Routes/SettingRoutes");

// Student profile and related routes.
const studentProfileRoutes = require("./Routes/StudentProfileRoute");
const entranceExamRoutes = require("./Routes/EntranceExamRoute");
const applicationRoutes = require("./Routes/ApplicationRoute");
const documentRoutes = require("./Routes/DocumentRoute");
const counsellingAssignmentRoutes = require("./Routes/CounsellingAssignmentRoute");
const appointmentRoutes = require("./Routes/AppointmentRoute");
const counsellingSessionRoutes = require("./Routes/CounsellingSessionRoute");
const counsellingNoteRoutes = require("./Routes/CounsellingNoteRoute");
const followUpRoutes = require("./Routes/FollowUpRoute");
const counsellingRequestRoutes = require("./Routes/CounsellingRequestRoute");
const counsellingDashboardRoutes = require("./Routes/CounsellingDashboardRoute");
const studentCounsellingRoutes = require("./Routes/StudentCounsellingRoute");
const workflowRoutes = require("./Routes/WorkflowRoutes");

// Initialize Express application.
const app = express();

// Configure application-level middleware.
if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN is required in production");
}

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173")
      .split(",")
      .map((o) => o.trim()),
  })
);
app.use(express.json());

// --------------------------------------------------
// AUTHENTICATION ROUTES
// --------------------------------------------------

// Login, signup and password recovery APIs.
app.use("/", loginRoutes);

// --------------------------------------------------
// STUDENT MANAGEMENT ROUTES
// --------------------------------------------------

// Student CRUD and bulk student management APIs.
app.use("/student", studentRoutes);
app.use("/student", bulkStudentRoutes);

// Student profile and profile-related APIs.
app.use("/student-profile", studentProfileRoutes);

// Student entrance examination APIs.
app.use("/entrance-exam", entranceExamRoutes);

// Student application APIs.
app.use("/application", applicationRoutes);

// Student document upload and management APIs.
app.use("/documents", documentRoutes);

// --------------------------------------------------
// ADMIN MANAGEMENT ROUTES
// --------------------------------------------------

// Role and permission management APIs.
app.use("/role", roleRoutes);

// User management APIs.
app.use("/user", userRoutes);

// College and university management APIs.
app.use("/college", collegeRoutes);
app.use("/university", universityRoutes);

// Academic stream, degree, course and specialization APIs.
app.use("/stream", streamRoutes);
app.use("/degree", degreeRoutes);
app.use("/course", courseRoutes);
app.use("/specialization", specializationRoutes);

// Email template and application settings APIs.
app.use("/email-template", emailTemplateRoutes);
app.use("/setting", settingsRoutes);

// Contact management APIs.
app.use("/contact", contactRoutes);
app.use("/counselling-assignment", counsellingAssignmentRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/counselling-session", counsellingSessionRoutes);
app.use("/counselling-note", counsellingNoteRoutes);
app.use("/follow-up", followUpRoutes);
app.use("/counselling", counsellingRequestRoutes);
app.use("/counselling-dashboard", counsellingDashboardRoutes);
app.use("/student-counselling", studentCounsellingRoutes);
app.use("/workflow", workflowRoutes);
// --------------------------------------------------
// TEST ROUTES
// --------------------------------------------------

// Verify that the application API is accessible.
app.get("/test-application", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Application route working",
  });
});

// Verify that the authenticated user can access protected APIs.
app.get("/profile", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected profile API",
    user: req.user,
  });
});

// Verify the Cloudinary connection.
app.get("/test-cloudinary", auth, superAdmin, async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    res.status(200).json({
      success: true,
      message: "Cloudinary connected successfully",
      result,
    });
  } catch (error) {
    console.error("Cloudinary error:", error);

    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 3000;

connectDB.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startFollowUpScheduler();
  });
});