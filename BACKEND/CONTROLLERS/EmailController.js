const EmailTemplate = require("../Models/EmailTemplate");

// CREATE EMAIL TEMPLATE
const createEmailTemplate = async (req, res) => {
  try {
    const { Title, Description, Content } = req.body;

    if (!Title || !Description || !Content) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newTemplate = new EmailTemplate({
      Title,
      Description,
      Content,
    });

    await newTemplate.save();

    res.status(201).json({
      message: "Email template created successfully",
      template: newTemplate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create email template",
      error: error.message,
    });
  }
};

// GET ALL EMAIL TEMPLATES
const getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      templates,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch email templates",
      error: error.message,
    });
  }
};

// UPDATE EMAIL TEMPLATE
const updateEmailTemplate = async (req, res) => {
  try {
    const { Title, Description, Content } = req.body;

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      {
        Title,
        Description,
        Content,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTemplate) {
      return res.status(404).json({
        message: "Email template not found",
      });
    }

    res.status(200).json({
      message: "Email template updated successfully",
      template: updatedTemplate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update email template",
      error: error.message,
    });
  }
};

// DELETE EMAIL TEMPLATE
const deleteEmailTemplate = async (req, res) => {
  try {
    const deletedTemplate = await EmailTemplate.findByIdAndDelete(
      req.params.id
    );

    if (!deletedTemplate) {
      return res.status(404).json({
        message: "Email template not found",
      });
    }

    res.status(200).json({
      message: "Email template deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete email template",
      error: error.message,
    });
  }
};

module.exports = {
  createEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  deleteEmailTemplate,
};

