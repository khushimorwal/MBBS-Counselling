const Course = require("../Models/Course");

const createCourse = async (req, res) => {
try {
const course = await Course.create(req.body);


res.status(201).json({
  status: true,
  message: "Course added successfully",
  course,
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

const getCourses = async (req, res) => {
try {
const courses = await Course.find()
.populate("stream", "name")
.populate("degree", "name")
.sort({ createdAt: -1 });


res.status(200).json({
  status: true,
  courses,
});


} catch (error) {
res.status(500).json({
status: false,
message: error.message,
});
}
};

const updateCourse = async (req, res) => {
try {
const course = await Course.findByIdAndUpdate(
req.params.id,
req.body,
{ new: true, runValidators: true }
);


if (!course) {
  return res.status(404).json({
    status: false,
    message: "Course not found",
  });
}

res.status(200).json({
  status: true,
  message: "Course updated successfully",
  course,
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

const deleteCourse = async (req, res) => {
try {
const course = await Course.findByIdAndDelete(req.params.id);


if (!course) {
  return res.status(404).json({
    status: false,
    message: "Course not found",
  });
}

res.status(200).json({
  status: true,
  message: "Course deleted successfully",
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

module.exports = {
createCourse,
getCourses,
updateCourse,
deleteCourse,
};
