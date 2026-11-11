const Settings = require("../Models/Setting");

// Get Settings
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    res.status(200).json({
      success: true,
      data: settings, // First time null return hoga
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // First time: Create new settings
      settings = await Settings.create(req.body);
    } else {
      // Next time: Update existing settings
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        { $set: req.body },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};