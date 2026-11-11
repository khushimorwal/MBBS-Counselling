const Student = require("../Models/StudentSchma");
const User = require("../Models/User");
const Role = require("../Models/Role");
const StudentProfile = require("../Models/StudentProfile");
const mongoose = require("mongoose");

const createStudent = async (req, res) => {
  try {
    const { name, email, phone,} = req.body;

    if (!name || !email || !phone) {
      return res.status(400).send({
        status: false,
        message: "All fields are required",
      });
    }

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(409).send({
        status: false,
        message: "Student already exists",
      });
    }

    const student = await Student.create({
      name,
      email,
      phone,
      
    });

    return res.status(201).send({
      status: true,
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};

// // GET API: Fetch all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    return res.status(200).send({
      status: true,
      students,
    });
  } catch (error) {
    console.log("Get students error:", error);

    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};



// VIEW ONE STUDENT
const getStudentById = async (req, res) => {
  try {
    console.log("UPDATED getStudentById RUNNING");
    
    const student = await Student.findById(req.params.id);
    

    if (!student) {
      return res.status(404).send({
        status: false,
        message: "Student not found",
      });
    }

    return res.status(200).send({
      status: true,
      student,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      status: false,
      message: "Invalid student ID",
    });
  }
};

// UPDATE STUDENT — changes saved in MongoDB
// PUT API: Update an existing student
const updateStudent = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const { id } = req.params;

    if (!name || !email || !phone) {
      return res.status(400).send({
        status: false,
        message: "Name, email and phone are required",
      });
    }

    // Find the student by ID
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).send({
        status: false,
        message: "Student not found",
      });
    }

    // Check whether another student already uses this email
    const existingStudent = await Student.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingStudent) {
      return res.status(409).send({
        status: false,
        message: "Email already exists",
      });
    }

    // Update student details
    student.name = name;
    student.email = email;
    student.phone = phone;

    await student.save();

    return res.status(200).send({
      status: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.log("Update student error:", error);

    return res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};

// DELETE STUDENT — removes from MongoDB
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).send({
        status: false,
        message: "Student not found",
      });
    }

    return res.status(200).send({
      status: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      status: false,
      message: "Invalid student ID",
    });
  }
};

const getRegisteredStudents = async (req, res) => {
  try {
    // Find Student role
    const studentRole = await Role.findOne({ role: "Student" });

    if (!studentRole) {
      return res.status(404).json({
        status: false,
        message: "Student role not found",
      });
    }

    // Fetch all registered student accounts
    const students = await User.find({
      roleId: studentRole._id,
    })
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      students,
    });
  } catch (error) {
    console.error("Get Registered Students Error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch registered students",
    });
  }
};

const getRegisteredStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check whether User ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    // Find registered user
    const user = await User.findById(userId).select("-password -otp -otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Student not found",
      });
    }

    // Verify that the account belongs to Student role
    const studentRole = await Role.findOne({ role: "Student" });

    if (!studentRole || user.roleId.toString() !== studentRole._id.toString()) {
      return res.status(403).json({
        status: false,
        message: "This account is not a student",
      });
    }

    // Find complete profile linked with this User
    const profile = await StudentProfile.findOne({ user: userId })
      .populate("entranceExams.exam")
      .populate("preferredCourses");

    // Profile may not have been created yet
    if (!profile) {
      return res.status(200).json({
        status: true,
        profileCompleted: false,
        profile: null,
        message: "Student profile not completed yet",
      });
    }

    return res.status(200).json({
      status: true,
      profileCompleted: true,
      profile,
    });

  } catch (error) {
    console.error("Get Registered Student Profile Error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch student profile",
    });
  }
};


module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getRegisteredStudents,
  getRegisteredStudentProfile
};