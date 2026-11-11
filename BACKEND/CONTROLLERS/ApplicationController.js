const Application = require("../Models/Application");

console.log("Application:", Application);
console.log("Application.find:", typeof Application.find);
const crypto = require("crypto");

// Generate Unique Application ID
const generateApplicationId = () => {
  return `APP-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
};

// 1. Create Application
const createApplication = async (req, res) => {
  try {
    const {
      collegeName,
      course,
      state,
      round,
      remarks,
    } = req.body;

    const application = new Application({
      student: req.user.id,
      applicationId: generateApplicationId(),
      collegeName,
      course,
      state,
      round,
      remarks,
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: "Application created successfully",
      application,
    });

  } catch (error) {
    console.error("Create Application Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get Logged-in Student Applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("Get Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get All Applications (Admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });

  } catch (error) {
    console.error("Get All Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Update Application Status
const updateApplicationStatus = async (req, res) => {
  try {
    if (!["Admin", "Super Admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Super Admin can update application status",
      });
    }

    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Application status is required",
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.status = status;

    if (remarks !== undefined) {
      application.remarks = remarks;
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });

  } catch (error) {
    console.error("Update Application Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  updateApplicationStatus,
  getAllApplications
};

