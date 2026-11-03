const Stream = require("../Models/Stream");

const createStream = async (req, res) => {
  try {
    const { name, slug, code, description, displayOrder, status, parentStream } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        status: false,
        message: "Name and slug are required",
      });
    }

    const stream = await Stream.create({
      name,
      slug,
      code,
      description,
      displayOrder,
      status,
      parentStream: parentStream || null,
    });

    return res.status(201).json({
      status: true,
      message: "Stream created successfully",
      stream,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const getStreams = async (req, res) => {
  try {
    const streams = await Stream.find()
      .populate("parentStream", "name")
      .sort({ displayOrder: 1 });

    return res.status(200).json({
      status: true,
      streams,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!stream) {
      return res.status(404).json({
        status: false,
        message: "Stream not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Stream updated successfully",
      stream,
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndDelete(req.params.id);

    if (!stream) {
      return res.status(404).json({
        status: false,
        message: "Stream not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Stream deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createStream,
  getStreams,
  updateStream,
  deleteStream,
};