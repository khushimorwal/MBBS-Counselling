const Degree = require("../Models/Degree");

const createDegree = async (req, res) => {
try {
const degree = await Degree.create(req.body);


res.status(201).json({
  status: true,
  message: "Degree created successfully",
  degree,
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

const getDegrees = async (req, res) => {
try {
const degrees = await Degree.find()
.populate("streams", "name")
.sort({ displayOrder: 1 });


res.status(200).json({
  status: true,
  degrees,
});


} catch (error) {
res.status(500).json({
status: false,
message: error.message,
});
}
};

const getDegreeById = async (req, res) => {
try {
const degree = await Degree.findById(req.params.id)
.populate("streams", "name");


if (!degree) {
  return res.status(404).json({
    status: false,
    message: "Degree not found",
  });
}

res.status(200).json({
  status: true,
  degree,
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

const updateDegree = async (req, res) => {
try {
const degree = await Degree.findByIdAndUpdate(
req.params.id,
req.body,
{
new: true,
runValidators: true,
}
);


if (!degree) {
  return res.status(404).json({
    status: false,
    message: "Degree not found",
  });
}

res.status(200).json({
  status: true,
  message: "Degree updated successfully",
  degree,
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

const deleteDegree = async (req, res) => {
try {
const degree = await Degree.findByIdAndDelete(req.params.id);


if (!degree) {
  return res.status(404).json({
    status: false,
    message: "Degree not found",
  });
}

res.status(200).json({
  status: true,
  message: "Degree deleted successfully",
});


} catch (error) {
res.status(400).json({
status: false,
message: error.message,
});
}
};

module.exports = {
createDegree,
getDegrees,
getDegreeById,
updateDegree,
deleteDegree,
};

