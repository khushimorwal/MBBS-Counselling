const University = require("../Models/University");

const addUniversity = async (req, res) => {
try {
const university = await University.create(req.body);

res.status(201).json({
  message: "University added successfully",
  university
});


} catch (error) {
res.status(400).json({
message: "Failed to add university",
error: error.message
});
}
};

const getUniversities = async (req, res) => {
try {
const universities = await University.find();


res.status(200).json(universities);


} catch (error) {
res.status(500).json({
message: "Failed to fetch universities",
error: error.message
});
}
};

const getUniversityById = async (req, res) => {
try {
const university = await University.findById(req.params.id);


if (!university) {
  return res.status(404).json({
    message: "University not found"
  });
}

res.status(200).json(university);


} catch (error) {
res.status(400).json({
message: "Failed to fetch university",
error: error.message
});
}
};

const updateUniversity = async (req, res) => {
try {
const university = await University.findByIdAndUpdate(
req.params.id,
req.body,
{
new: true,
runValidators: true
}
);


if (!university) {
  return res.status(404).json({
    message: "University not found"
  });
}

res.status(200).json({
  message: "University updated successfully",
  university
});


} catch (error) {
res.status(400).json({
message: "Failed to update university",
error: error.message
});
}
};

const deleteUniversity = async (req, res) => {
try {
const university = await University.findByIdAndDelete(req.params.id);


if (!university) {
  return res.status(404).json({
    message: "University not found"
  });
}

res.status(200).json({
  message: "University deleted successfully"
});


} catch (error) {
res.status(400).json({
message: "Failed to delete university",
error: error.message
});
}
};

module.exports = {
addUniversity,
getUniversities,
getUniversityById,
updateUniversity,
deleteUniversity
};
