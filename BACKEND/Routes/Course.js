const express = require("express");
const router = express.Router();

const upload = require("../Middleware/uploadExcel");

const {
  bulkImportCourses,
} = require("../CONTROLLERS/BulkCourse");

const {
createCourse,
getCourses,
updateCourse,
deleteCourse,
} = require("../CONTROLLERS/CourseController");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// View all courses
router.get(
"/all",
Auth,
Permission("courses.view"),
getCourses
);


router.post(
  "/bulk-import",
  Auth,
  Permission("courses.add"),
  upload.single("file"),
  bulkImportCourses
);

// Create a course
router.post(
"/create",
Auth,
Permission("courses.add"),
createCourse
);

// Update a course
router.put(
"/update/:id",
Auth,
Permission("courses.edit"),
updateCourse
);

// Delete a course
router.delete(
"/delete/:id",
Auth,
Permission("courses.delete"),
deleteCourse
);

module.exports = router;
