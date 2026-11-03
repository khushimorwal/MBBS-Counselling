const University = require("../Models/University");
const cloudinary = require("../config/cloudnary");
const XLSX = require("xlsx");

const bulkImportUniversities = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet);

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const universities = rows.map((row) => ({
      name: row["University Name"],
      shortName: row["Short Name"],
      logo: row["Logo"],
      type: row["Type"]?.toLowerCase(),
      establishedYear: row["Established Year"],
      location: {
        city: row["City"],
        state: row["State"],
        country: row["Country"],
      },
      website: row["Website"],
    }));

    const validUniversities = universities.filter(
      (university) => university.name
    );

    if (!validUniversities.length) {
      return res.status(400).json({
        success: false,
        message: "No valid university records found",
      });
    }

    const result = await University.insertMany(validUniversities, {
      ordered: false,
    });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "universities",
          resource_type: "raw",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    res.status(201).json({
      success: true,
      message: "University bulk import completed",
      importedCount: result.length,
      cloudinaryUrl: uploadResult.secure_url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "University bulk import failed",
      error: error.message,
    });
  }
};

module.exports = { bulkImportUniversities };