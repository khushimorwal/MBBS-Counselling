require("dotenv").config();
const express = require("express");
const cloudinary = require('./config/cloudnary');
const cors = require("cors");
require("./config/db");
const loginRoutes = require("./Routes/login");


const studentRoutes = require("./Routes/StudentRoute");
const roleRoutes = require("./Routes/RoleRoutes");
const collegeRoutes = require("./Routes/College");
const universityRoutes = require("./Routes/University");
const streamRoutes = require("./Routes/Stream");
const degree  = require("./Routes/Degree")
const courseRoutes = require("./Routes/Course");
const specializationRoutes = require("./Routes/SpecializationRoute");
const auth = require("./Auth");
const emailTemplate = require("./Routes/EmailTemplateRoute");
const userRoutes = require("./Routes/User");
const contactRoutes = require("./Routes/ContactRoute");
const bulkStudentRoutes = require("./Routes/BulkstudentRoutes");
const settingsRoutes = require("./Routes/SettingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Registers login and password recovery APIs
app.use("/", loginRoutes);
app.use("/student", studentRoutes);
app.use("/role", roleRoutes);
app.use("/college", collegeRoutes);
app.use("/university", universityRoutes);
app.use("/stream", streamRoutes);
app.use("/degree", degree)
app.use("/course", courseRoutes);
app.use("/specialization" , specializationRoutes );
app.use("/setting", settingsRoutes);



app.use("/email-template", emailTemplate);
app.use("/user" ,userRoutes);
app.use("/contact", contactRoutes);
app.use("/student", bulkStudentRoutes);



// Connects to MongoDB and starts the server

app.get("/profile", auth, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected profile API",
        user: req.user
    });
});




app.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    res.status(200).json({
      status: true,
      message: "Cloudinary connected successfully",
      result,
    });
  } catch (error) {
    console.log("Cloudinary error:", error);

    res.status(500).json({
      status: false,
      message: "Cloudinary connection failed",
    });
  }
});





const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

