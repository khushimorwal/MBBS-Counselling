const Course = require("../Models/Course");
const Stream = require("../Models/Stream");
const Degree = require("../Models/Degree");
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

const bulkImportCourses = async (req, res) => {
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

    // Get Streams
    const existingStreams = await Stream.find()
      .select("name")
      .lean();

    // Get Degrees
    const existingDegrees = await Degree.find()
      .select("name")
      .lean();

    // Stream name -> ObjectId
    const streamMap = new Map();

    existingStreams.forEach((stream) => {
      const key = String(stream.name)
        .trim()
        .toLowerCase();

      streamMap.set(key, stream._id);
    });

    // Degree name -> ObjectId
    const degreeMap = new Map();

    existingDegrees.forEach((degree) => {
      const key = String(degree.name)
        .trim()
        .toLowerCase();

      degreeMap.set(key, degree._id);
    });

    const validStatuses = ["active", "inactive"];

    const courses = [];
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

      const streamName = String(
        getValue(row, "Stream") || ""
      ).trim();

      const degreeName = String(
        getValue(row, "Degree") || ""
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
      } else if (!streamName) {
        reason = "Stream is required";
      } else if (!degreeName) {
        reason = "Degree is required";
      } else if (!durationText) {
        reason = "Duration is required";
      }

      // Status validation
      else if (!validStatuses.includes(status)) {
        reason = `Invalid Status: ${status}`;
      }

      // Duplicate in Excel
      else if (seenSlugs.has(slug)) {
        reason = `Duplicate Course Name in Excel: ${name}`;
      } else if (code && seenCodes.has(code)) {
        reason = `Duplicate Code in Excel: ${code}`;
      }

      // Check Stream
      else if (
        !streamMap.has(streamName.toLowerCase())
      ) {
        reason = `Stream not found: ${streamName}`;
      }

      // Check Degree
      else if (
        !degreeMap.has(degreeName.toLowerCase())
      ) {
        reason = `Degree not found: ${degreeName}`;
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
            "Duration must be like 5 years or 6 months";
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

      // Course object
      const course = {
        name,
        slug,
        stream: streamMap.get(
          streamName.toLowerCase()
        ),
        degree: degreeMap.get(
          degreeName.toLowerCase()
        ),
        duration: {
          value: durationValue,
          unit: durationUnit,
        },
        status,
      };

      // Optional code
      if (code) {
        course.code = code;
      }

      // Logged-in user
      if (req.user && req.user.id) {
        course.createdBy = req.user.id;
      }

      courses.push({
        excelRow,
        data: course,
      });
    });

    // No valid courses
    if (!courses.length) {
      return res.status(422).json({
        status: false,
        message: "No valid course records found",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // Check existing courses
    const slugs = courses.map(
      (item) => item.data.slug
    );

    const codes = courses
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

    const existingCourses = await Course.find({
      $or: conditions,
    })
      .select("slug code")
      .lean();

    const existingSlugs = new Set(
      existingCourses.map((item) =>
        String(item.slug).trim().toLowerCase()
      )
    );

    const existingCodes = new Set(
      existingCourses
        .filter((item) => item.code)
        .map((item) =>
          String(item.code).trim().toUpperCase()
        )
    );

    const newCourses = [];

    courses.forEach(({ excelRow, data }) => {
      if (
        existingSlugs.has(
          data.slug.toLowerCase()
        )
      ) {
        skipped.push({
          row: excelRow,
          reason: `Course already exists: ${data.name}`,
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
        newCourses.push(data);
      }
    });

    // Nothing new
    if (!newCourses.length) {
      return res.status(200).json({
        status: true,
        message: "No new courses to import",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // Insert courses
    const result = await Course.insertMany(
      newCourses,
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
                folder: "courses",
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
      message: "Course bulk import completed",
      importedCount: result.length,
      skippedCount: skipped.length,
      skipped,
      cloudinaryUrl,
    });
  } catch (error) {
    console.error(
      "Bulk Course Import Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Course bulk import failed",
      error: error.message,
    });
  }
};

module.exports = {
  bulkImportCourses,
};