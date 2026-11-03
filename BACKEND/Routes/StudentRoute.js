const express = require("express");
const router = express.Router();

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

const {
createStudent,
getStudents,
getStudentById,
updateStudent,
deleteStudent,
} = require("../CONTROLLERS/StudentControllers");

// Create student
router.post(
"/create",
Auth,
Permission("students.add"),
createStudent
);

// Get all students
router.get(
"/get-all",
Auth,
Permission("students_view"),
getStudents
);

// Get student by ID
router.get(
"/get-by-id/:id",
Auth,
Permission("students.view"),
getStudentById
);

// Update student
router.put(
"/update/:id",
Auth,
Permission("students.edit"),
updateStudent
);

// Delete student
router.delete(
"/delete/:id",
Auth,
Permission("students.delete"),
deleteStudent
);

module.exports = router;

