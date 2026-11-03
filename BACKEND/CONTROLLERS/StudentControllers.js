const Student = require("../Models/StudentSchma");

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
    const student = await Student.findById(req.params.id).populate("role");

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



module.exports = {
  createStudent,
  getStudents,
   getStudentById,
  updateStudent,
  deleteStudent,
};