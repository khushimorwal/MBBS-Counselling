
const College = require("../Models/College");

// Add College
const addCollege = async (req, res) => {
  try {
    // FormData se college data receive karna
    const collegeData = JSON.parse(
      req.body.collegeData || "{}"
    );

    // Uploaded logo ka path save karna
    if (req.file) {
      collegeData.logo = `/uploads/college-logos/${req.file.filename}`;
    }

    const college = await College.create(collegeData);

    res.status(201).json({
      message: "College added successfully",
      college,
    });
  } catch (error) {
    console.log("Add College Error:", error);

    res.status(400).json({
      message: "Failed to add college",
      error: error.message,
    });
  }
};

// Get All Colleges
const getColleges = async (req, res) => {
  try {
    const colleges = await College.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Colleges fetched successfully",
      colleges,
    });
  } catch (error) {
    console.error("Get Colleges Error:", error);

    res.status(500).json({
      message: "Failed to fetch colleges",
      error: error.message,
    });
  }
};

// Get College By ID
const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id)
      .populate("university", "name shortName");

    if (!college) {
      return res.status(404).json({
        message: "College not found",
      });
    }

    res.status(200).json(college);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch college",
      error: error.message,
    });
  }
};

// Update College
const updateCollege = async (req, res) => {
  try {
    // FormData se college data receive karna
    const updateData = JSON.parse(
      req.body.collegeData || "{}"
    );

    // Naya logo upload hua hai toh uska path update karo
    if (req.file) {
      updateData.logo = `/uploads/college-logos/${req.file.filename}`;
    }

    const college = await College.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!college) {
      return res.status(404).json({
        message: "College not found",
      });
    }

    res.status(200).json({
      message: "College updated successfully",
      college,
    });
  } catch (error) {
    console.log("Update College Error:", error);

    res.status(400).json({
      message: "Failed to update college",
      error: error.message,
    });
  }
};

// Delete College
const deleteCollege = async (req, res) => {
  try {
    const college = await College.findByIdAndDelete(
      req.params.id
    );

    if (!college) {
      return res.status(404).json({
        message: "College not found",
      });
    }

    res.status(200).json({
      message: "College deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete college",
      error: error.message,
    });
  }
};

module.exports = {
  addCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
};
