const EntranceExam = require("../Models/EntranceExam");

// Create Entrance Exam
const createEntranceExam = async (req, res) => {
  try {
    const {
      name,
      shortName,
      description,
      conductingBody,
      examLevel,
      status,
    } = req.body;

    if (!name || !shortName) {
      return res.status(400).json({
        success: false,
        message: "Exam name and short name are required",
      });
    }

    const existingExam = await EntranceExam.findOne({
      $or: [
        { name: name.trim() },
        { shortName: shortName.trim() },
      ],
    });

    if (existingExam) {
      return res.status(409).json({
        success: false,
        message: "Entrance exam already exists",
      });
    }

    const exam = await EntranceExam.create({
      name,
      shortName,
      description,
      conductingBody,
      examLevel,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Entrance exam created successfully",
      exam,
    });
  } catch (error) {
    console.log("Create Entrance Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating entrance exam",
      error: error.message,
    });
  }
};

// Get All Entrance Exams
const getEntranceExams = async (req, res) => {
  try {
    const exams = await EntranceExam.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Entrance exams fetched successfully",
      exams,
    });
  } catch (error) {
    console.log("Get Entrance Exams Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching entrance exams",
      error: error.message,
    });
  }
};

// Get Entrance Exam By ID
const getEntranceExamById = async (req, res) => {
  try {
    const exam = await EntranceExam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Entrance exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Entrance exam fetched successfully",
      exam,
    });
  } catch (error) {
    console.log("Get Entrance Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching entrance exam",
      error: error.message,
    });
  }
};

// Update Entrance Exam
const updateEntranceExam = async (req, res) => {
  try {
    const exam = await EntranceExam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Entrance exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Entrance exam updated successfully",
      exam,
    });
  } catch (error) {
    console.log("Update Entrance Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error updating entrance exam",
      error: error.message,
    });
  }
};

// Delete Entrance Exam
const deleteEntranceExam = async (req, res) => {
  try {
    const exam = await EntranceExam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Entrance exam not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Entrance exam deleted successfully",
    });
  } catch (error) {
    console.log("Delete Entrance Exam Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting entrance exam",
      error: error.message,
    });
  }
};

module.exports = {
  createEntranceExam,
  getEntranceExams,
  getEntranceExamById,
  updateEntranceExam,
  deleteEntranceExam,
};