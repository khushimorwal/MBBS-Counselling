const Stream = require("../Models/Stream");
const XLSX = require("xlsx");
const cloudinary = require("../config/cloudnary");

const bulkImportStreams = async (req, res) => {
  try {
    // Check Excel file
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Please upload an Excel file",
      });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (!rows.length) {
      return res.status(400).json({
        status: false,
        message: "Excel file is empty",
      });
    }

    // Convert Excel data into Stream format
    const streams = rows
      .filter((row) => row["Stream Name"])
      .map((row, index) => ({
        name: String(row["Stream Name"]).trim(),

        slug: String(row["Stream Name"])
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),

        code: row["Stream Code"]
          ? String(row["Stream Code"]).trim().toUpperCase()
          : undefined,

        description: row["Description"] || "",

        status: row["Status"]
          ? String(row["Status"]).trim().toLowerCase()
          : "active",

        displayOrder: index + 1,
      }));

    if (!streams.length) {
      return res.status(400).json({
        status: false,
        message: "No valid stream records found",
      });
    }

    // Insert streams into MongoDB
    const result = await Stream.insertMany(streams, {
      ordered: false,
    });

    // Upload Excel file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "streams",
          resource_type: "raw",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    return res.status(201).json({
      status: true,
      message: "Stream bulk import completed",
      importedCount: result.length,
      cloudinaryUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Bulk Stream Import Error:", error);

    return res.status(500).json({
      status: false,
      message: "Stream bulk import failed",
      error: error.message,
    });
  }
};

module.exports = {
  bulkImportStreams,
};