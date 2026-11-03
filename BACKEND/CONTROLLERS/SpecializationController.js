const Specialization = require("../Models/Specialization");
const Course = require("../Models/Course");
const XLSX = require("xlsx");

// ==========================================
// SLUG GENERATE
// ==========================================
const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ==========================================
// CREATE SPECIALIZATION
// ==========================================
const createSpecialization = async (req, res) => {
  try {
    const {
      name,
      slug,
      code,
      description,
      course,
      duration,
      eligibility,
      careerOptions,
      status,
      createdBy,
    } = req.body;

    const specialization = await Specialization.create({
      name,
      slug,
      code,
      description,
      course,
      duration,
      eligibility,
      careerOptions,
      status,
      createdBy: createdBy || req.user?.id,
    });

    return res.status(201).json({
      status: true,
      message: "Specialization created successfully",
      data: specialization,
    });
  } catch (error) {
    console.error("Create specialization error:", error);

    return res.status(500).json({
      status: false,
      message: "Specialization create nahi ho paayi",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL SPECIALIZATIONS
// ==========================================
const getSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.find()
      .populate("course", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Specializations fetched successfully",
      data: specializations,
    });
  } catch (error) {
    console.error("Get specializations error:", error);

    return res.status(500).json({
      status: false,
      message: "Specializations fetch nahi ho paayi",
      error: error.message,
    });
  }
};

// ==========================================
// GET SPECIALIZATION BY ID
// ==========================================
const getSpecializationById = async (req, res) => {
  try {
    const specialization = await Specialization.findById(req.params.id)
      .populate("course", "name");

    if (!specialization) {
      return res.status(404).json({
        status: false,
        message: "Specialization nahi mili",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Specialization fetched successfully",
      data: specialization,
    });
  } catch (error) {
    console.error("Get specialization error:", error);

    return res.status(500).json({
      status: false,
      message: "Specialization fetch nahi ho paayi",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE SPECIALIZATION
// ==========================================
const updateSpecialization = async (req, res) => {
  try {
    const specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("course", "name");

    if (!specialization) {
      return res.status(404).json({
        status: false,
        message: "Specialization nahi mili",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Specialization updated successfully",
      data: specialization,
    });
  } catch (error) {
    console.error("Update specialization error:", error);

    return res.status(500).json({
      status: false,
      message: "Specialization update nahi ho paayi",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SPECIALIZATION
// ==========================================
const deleteSpecialization = async (req, res) => {
  try {
    const specialization = await Specialization.findByIdAndDelete(
      req.params.id
    );

    if (!specialization) {
      return res.status(404).json({
        status: false,
        message: "Specialization nahi mili",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Specialization deleted successfully",
    });
  } catch (error) {
    console.error("Delete specialization error:", error);

    return res.status(500).json({
      status: false,
      message: "Specialization delete nahi ho paayi",
      error: error.message,
    });
  }
};

// ==========================================
// BULK IMPORT SPECIALIZATIONS
// ==========================================
const bulkImportSpecializations = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Please upload an Excel file",
      });
    }

    let workbook;

    try {
      workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
      });
    } catch (error) {
      return res.status(400).json({
        status: false,
        message: "Unable to read Excel file",
      });
    }

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

    // ==========================================
    // GET EXISTING COURSES
    // ==========================================
    const existingCourses = await Course.find()
      .select("name")
      .lean();

    const courseMap = new Map(
      existingCourses.map((course) => [
        String(course.name).trim().toLowerCase(),
        course._id,
      ])
    );

    const validStatuses = ["active", "inactive"];

    const specializations = [];
    const skipped = [];

    const seenSlugs = new Set();
    const seenCodes = new Set();

    // ==========================================
    // PROCESS EXCEL ROWS
    // ==========================================
    rows.forEach((row, index) => {
      const excelRow = index + 2;

      const name = String(row["Name"] || "").trim();

      const code = String(row["Code"] || "")
        .trim()
        .toUpperCase();

      const courseName = String(row["Course"] || "").trim();

      const durationText = String(row["Duration"] || "")
        .trim()
        .toLowerCase();

      const status = String(row["Status"] || "active")
        .trim()
        .toLowerCase();

      const slug = slugify(name);

      let reason = "";

      if (!name || !courseName || !durationText) {
        reason = "Name, Course and Duration are required";
      } else if (!validStatuses.includes(status)) {
        reason = `Invalid Status: ${status}`;
      } else if (seenSlugs.has(slug)) {
        reason = `Duplicate Specialization Name in Excel: ${name}`;
      } else if (code && seenCodes.has(code)) {
        reason = `Duplicate Code in Excel: ${code}`;
      } else if (!courseMap.has(courseName.toLowerCase())) {
        reason = `Course not found: ${courseName}`;
      }

      let durationValue;
      let durationUnit;

      if (!reason) {
        const durationParts = durationText.split(/\s+/);

        durationValue = Number(durationParts[0]);
        durationUnit = durationParts[1];

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
          reason = "Duration must be like: 3 years or 6 months";
        } else if (
          !["months", "years"].includes(durationUnit)
        ) {
          reason = "Duration unit must be months or years";
        }
      }

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

      const specialization = {
        name,
        slug,
        course: courseMap.get(courseName.toLowerCase()),

        duration: {
          value: durationValue,
          unit: durationUnit,
        },

        status,
      };

      if (code) {
        specialization.code = code;
      }

      if (req.user?.id) {
        specialization.createdBy = req.user.id;
      }

      specializations.push({
        excelRow,
        data: specialization,
      });
    });

    // ==========================================
    // NO VALID DATA
    // ==========================================
    if (!specializations.length) {
      return res.status(422).json({
        status: false,
        message: "No valid specialization records found",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // ==========================================
    // CHECK DUPLICATES IN DATABASE
    // ==========================================
    const conditions = [
      {
        slug: {
          $in: specializations.map(
            (item) => item.data.slug
          ),
        },
      },
    ];

    const codes = specializations
      .map((item) => item.data.code)
      .filter(Boolean);

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
      existingSpecializations.map((item) => item.slug)
    );

    const existingCodes = new Set(
      existingSpecializations
        .map((item) => item.code)
        .filter(Boolean)
        .map((item) => item.toUpperCase())
    );

    const newSpecializations = [];

    specializations.forEach(({ excelRow, data }) => {
      if (existingSlugs.has(data.slug)) {
        skipped.push({
          row: excelRow,
          reason: `Specialization already exists: ${data.name}`,
        });
      } else if (
        data.code &&
        existingCodes.has(data.code)
      ) {
        skipped.push({
          row: excelRow,
          reason: `Code already exists: ${data.code}`,
        });
      } else {
        newSpecializations.push(data);
      }
    });

    // ==========================================
    // NO NEW RECORDS
    // ==========================================
    if (!newSpecializations.length) {
      return res.status(200).json({
        status: true,
        message: "No new specializations to import",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // ==========================================
    // INSERT DATA
    // ==========================================
    const result = await Specialization.insertMany(
      newSpecializations,
      {
        ordered: true,
      }
    );

    return res.status(201).json({
      status: true,
      message: "Specialization bulk import completed",
      importedCount: result.length,
      skippedCount: skipped.length,
      skipped,
    });
  } catch (error) {
    console.error(
      "Bulk Specialization Import Error:",
      error
    );

    return res.status(500).json({
      status: false,
      message: "Specialization bulk import failed",
      error: error.message,
    });
  }
};

module.exports = {
  createSpecialization,
  getSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
  bulkImportSpecializations,
};