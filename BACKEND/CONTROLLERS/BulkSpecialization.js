const Specialization = require("../Models/Specialization");
const Course = require("../Models/Course");
const XLSX = require("xlsx");
const cloudinary = require("../config/cloudnary");

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Excel header/value safely read karne ke liye
const getValue = (row, headerName) => {
  const key = Object.keys(row).find(
    (item) =>
      String(item)
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase() === headerName.toLowerCase()
  );

  return key ? row[key] : "";
};

const bulkImportSpecializations = async (req, res) => {
  try {
    // Check file
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Please upload an Excel file",
      });
    }

    // Read Excel
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return res.status(400).json({
        status: false,
        message: "Excel sheet not found",
      });
    }

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
    });

    if (!rows.length) {
      return res.status(400).json({
        status: false,
        message: "Excel file is empty",
      });
    }

    // Get Courses
    const existingCourses = await Course.find()
      .select("name")
      .lean();

    // Course name -> ObjectId
    const courseMap = new Map();

    existingCourses.forEach((course) => {
      const key = String(course.name)
        .trim()
        .toLowerCase();

      courseMap.set(key, course._id);
    });

    const validStatuses = ["active", "inactive"];

    const specializations = [];
    const skipped = [];

    const seenSlugs = new Set();
    const seenCodes = new Set();

    // Process Excel rows
    rows.forEach((row, index) => {
      const excelRow = index + 2;

      const name = String(
        getValue(row, "Name") || ""
      ).trim();

      const code = String(
        getValue(row, "Code") || ""
      )
        .trim()
        .toUpperCase();

      const courseName = String(
        getValue(row, "Course") || ""
      ).trim();

      const durationText = String(
        getValue(row, "Duration") || ""
      )
        .trim()
        .toLowerCase();

      const status = String(
        getValue(row, "Status") || "active"
      )
        .trim()
        .toLowerCase();

      const slug = slugify(name);

      let reason = "";

      // Required validation
      if (!name) {
        reason = "Name is required";
      } else if (!courseName) {
        reason = "Course is required";
      } else if (!durationText) {
        reason = "Duration is required";
      }

      // Status validation
      else if (!validStatuses.includes(status)) {
        reason = `Invalid Status: ${status}`;
      }

      // Duplicate in Excel
      else if (seenSlugs.has(slug)) {
        reason = `Duplicate Specialization Name in Excel: ${name}`;
      } else if (code && seenCodes.has(code)) {
        reason = `Duplicate Code in Excel: ${code}`;
      }

      // Check Course
      else if (
        !courseMap.has(courseName.toLowerCase())
      ) {
        reason = `Course not found: ${courseName}`;
      }

      // Duration
      let durationValue;
      let durationUnit;

      if (!reason) {
        const parts = durationText.split(/\s+/);

        durationValue = Number(parts[0]);
        durationUnit = parts[1];

        if (durationUnit === "year") {
          durationUnit = "years";
        }

        if (durationUnit === "month") {
          durationUnit = "months";
        }

        if (
          !Number.isFinite(durationValue) ||
          durationValue < 0
        ) {
          reason =
            "Duration must be like 3 years or 6 months";
        } else if (
          !["years", "months"].includes(durationUnit)
        ) {
          reason =
            "Duration unit must be years or months";
        }
      }

      // Skip invalid
      if (reason) {
        skipped.push({
          row: excelRow,
          reason,
        });

        return;
      }

      seenSlugs.add(slug);

      if (code) {
        seenCodes.add(code);
      }

      // Specialization object
      const specialization = {
        name,
        slug,
        course: courseMap.get(
          courseName.toLowerCase()
        ),
        duration: {
          value: durationValue,
          unit: durationUnit,
        },
        status,
      };

      // Optional code
      if (code) {
        specialization.code = code;
      }

      // Logged-in user
      if (req.user && req.user.id) {
        specialization.createdBy = req.user.id;
      }

      specializations.push({
        excelRow,
        data: specialization,
      });
    });

    // No valid specializations
    if (!specializations.length) {
      return res.status(422).json({
        status: false,
        message:
          "No valid specialization records found",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // Check existing specializations
    const slugs = specializations.map(
      (item) => item.data.slug
    );

    const codes = specializations
      .map((item) => item.data.code)
      .filter(Boolean);

    const conditions = [
      {
        slug: {
          $in: slugs,
        },
      },
    ];

    if (codes.length) {
      conditions.push({
        code: {
          $in: codes,
        },
      });
    }

    const existingSpecializations =
      await Specialization.find({
        $or: conditions,
      })
        .select("slug code")
        .lean();

    const existingSlugs = new Set(
      existingSpecializations.map((item) =>
        String(item.slug).trim().toLowerCase()
      )
    );

    const existingCodes = new Set(
      existingSpecializations
        .filter((item) => item.code)
        .map((item) =>
          String(item.code).trim().toUpperCase()
        )
    );

    const newSpecializations = [];

    specializations.forEach(({ excelRow, data }) => {
      if (
        existingSlugs.has(
          data.slug.toLowerCase()
        )
      ) {
        skipped.push({
          row: excelRow,
          reason: `Specialization already exists: ${data.name}`,
        });
      } else if (
        data.code &&
        existingCodes.has(data.code.toUpperCase())
      ) {
        skipped.push({
          row: excelRow,
          reason: `Code already exists: ${data.code}`,
        });
      } else {
        newSpecializations.push(data);
      }
    });

    // Nothing new
    if (!newSpecializations.length) {
      return res.status(200).json({
        status: true,
        message:
          "No new specializations to import",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // Insert specializations
    const result =
      await Specialization.insertMany(
        newSpecializations,
        {
          ordered: true,
        }
      );

    // Upload Excel to Cloudinary
    let cloudinaryUrl = null;

    try {
      const uploadResult = await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: "specializations",
                resource_type: "raw",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );

          uploadStream.end(req.file.buffer);
        }
      );

      cloudinaryUrl = uploadResult.secure_url;
    } catch (error) {
      console.log(
        "Cloudinary upload failed:",
        error.message
      );
    }

    return res.status(201).json({
      status: true,
      message:
        "Specialization bulk import completed",
      importedCount: result.length,
      skippedCount: skipped.length,
      skipped,
      cloudinaryUrl,
    });
  } catch (error) {
    console.error(
      "Bulk Specialization Import Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message:
        "Specialization bulk import failed",
      error: error.message,
    });
  }
};

module.exports = {
  bulkImportSpecializations,
};