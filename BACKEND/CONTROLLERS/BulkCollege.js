const xlsx = require("xlsx");
const College = require("../Models/College");
const cloudinary = require("../config/cloudnary");

// Allowed college types
const allowedCollegeTypes = [
  "government",
  "private",
  "deemed",
  "autonomous",
  "public",
];

// Upload Excel file to Cloudinary
const uploadExcelToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "college_excel",
        public_id: `colleges_${Date.now()}.xlsx`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

// Read Excel file
const readExcelFile = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const colleges = xlsx.utils.sheet_to_json(worksheet);

  return colleges;
};

// Validate Excel rows
const validateColleges = (colleges) => {
  const validColleges = [];
  const errors = [];

  colleges.forEach((college, index) => {
    const {
      "College Name": name,
      Type: collegeType,
      Email: email,
      State: state,
      City: city,
      "College Website": website,
    } = college;

    // Check required fields
    if (!name || !collegeType || !email || !state || !city) {
      errors.push({
        row: index + 2,
        message: "College Name, Type, Email, State and City are required",
      });

      return;
    }

    // Validate college type
    const normalizedType = String(collegeType).trim().toLowerCase();

    if (!allowedCollegeTypes.includes(normalizedType)) {
      errors.push({
        row: index + 2,
        message: "Invalid college type",
      });

      return;
    }

    // Validate email format
    const normalizedEmail = String(email).trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      errors.push({
        row: index + 2,
        message: "Invalid email format",
      });

      return;
    }

    // Prepare college data according to MongoDB schema
    validColleges.push({
      name: String(name).trim(),

      collegeType: normalizedType,

      contact: {
        email: normalizedEmail,
      },

      location: {
        state: String(state).trim(),
        city: String(city).trim(),
      },

      website: website ? String(website).trim() : "",

      // Generate unique slug from college name
      slug: `${String(name)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now()}-${index}`,
    });
  });

  return {
    validColleges,
    errors,
  };
};

// Save valid colleges to MongoDB
const saveCollegesToDB = async (colleges) => {
  const validColleges = [];
  const errors = [];

  for (let i = 0; i < colleges.length; i++) {
    const college = colleges[i];

    // Check duplicate email
    const existingCollege = await College.findOne({
      "contact.email": college.contact.email,
    });

    if (existingCollege) {
      errors.push({
        email: college.contact.email,
        message: "College email already exists",
      });
    } else {
      validColleges.push(college);
    }
  }

  // Insert valid colleges
  if (validColleges.length > 0) {
    await College.insertMany(validColleges);
  }

  return {
    importedCount: validColleges.length,
    errors,
  };
};

// Main bulk import controller
const bulkImportColleges = async (req, res) => {
  try {
    // Check uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an XLSX file",
      });
    }

    // Upload Excel file to Cloudinary
    const cloudinaryResult = await uploadExcelToCloudinary(req.file);

    // Read Excel data
    const colleges = readExcelFile(req.file.buffer);

    // Validate Excel data
    const {
      validColleges,
      errors: validationErrors,
    } = validateColleges(colleges);

    // Save valid colleges
    const result = await saveCollegesToDB(validColleges);

    res.status(200).json({
      success: true,
      message: "College bulk import completed",
      importedCount: result.importedCount,
      errors: [...validationErrors, ...result.errors],
      cloudinaryUrl: cloudinaryResult.secure_url,
    });

  } catch (error) {
    console.error("Bulk College Import Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadExcelToCloudinary,
  readExcelFile,
  validateColleges,
  saveCollegesToDB,
  bulkImportColleges,
};