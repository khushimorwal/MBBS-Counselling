const Degree = require("../Models/Degree");
const Stream = require("../Models/Stream");
const XLSX = require("xlsx");
const cloudinary = require("../config/cloudnary");

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const bulkImportDegrees = async (req, res) => {
  try {
    // 1. Check Excel file
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "Please upload an Excel file",
      });
    }

    // 2. Read Excel file
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

    // 3. Fetch existing streams
    const existingStreams = await Stream.find()
      .select("name")
      .lean();

    const streamMap = new Map(
      existingStreams.map((stream) => [
        String(stream.name).trim().toLowerCase(),
        stream._id,
      ])
    );

    // 4. Allowed schema values
    const validLevels = [
      "certificate",
      "diploma",
      "undergraduate",
      "postgraduate",
      "doctoral",
      "postdoctoral",
      "other",
    ];

    const validDegreeTypes = [
      "academic",
      "professional",
      "vocational",
      "research",
      "other",
    ];

    const validStatuses = ["active", "inactive"];

    const degrees = [];
    const skipped = [];
    const seenSlugs = new Set();
    const seenCodes = new Set();

    // 5. Convert Excel data into Degree format
    rows.forEach((row, index) => {
      const excelRow = index + 2;

      const name = String(row["Name"] || "").trim();
      const shortName = String(row["Short Name"] || "").trim();

      const slug = slugify(row["Slug"] || name);

      const code = String(row["Code"] || "")
        .trim()
        .toUpperCase();

      const level = String(row["Level"] || "")
        .trim()
        .toLowerCase();

      const degreeType = String(
        row["Degree Type"] || "academic"
      )
        .trim()
        .toLowerCase();

      const status = String(row["Status"] || "active")
        .trim()
        .toLowerCase();

      const durationRaw = row["Duration Value"];
      const durationUnit = String(
        row["Duration Unit"] || ""
      )
        .trim()
        .toLowerCase();

      const hasDuration =
        durationRaw !== "" &&
        durationRaw !== null &&
        durationRaw !== undefined;

      const durationValue = hasDuration
        ? Number(durationRaw)
        : undefined;

      const orderRaw = row["Display Order"];

      const displayOrder =
        orderRaw === "" ||
        orderRaw === null ||
        orderRaw === undefined
          ? index + 1
          : Number(orderRaw);

      const description = String(
        row["Description"] || ""
      ).trim();

      // Stream names: Medical, Dental, etc.
      const streamNames = [
        ...new Set(
          String(row["Streams"] || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];

      let reason = "";

      if (!name || !shortName || !slug || !level) {
        reason =
          "Name, Short Name, Level and Slug are required";
      } else if (!validLevels.includes(level)) {
        reason = `Invalid Level: ${level}`;
      } else if (!validDegreeTypes.includes(degreeType)) {
        reason = `Invalid Degree Type: ${degreeType}`;
      } else if (!validStatuses.includes(status)) {
        reason = `Invalid Status: ${status}`;
      } else if (
        hasDuration &&
        (!Number.isFinite(durationValue) || durationValue < 0)
      ) {
        reason = "Duration Value must be a non-negative number";
      } else if (
        (hasDuration && !durationUnit) ||
        (!hasDuration && durationUnit)
      ) {
        reason = "Provide both Duration Value and Duration Unit";
      } else if (
        durationUnit &&
        !["months", "years"].includes(durationUnit)
      ) {
        reason = "Duration Unit must be months or years";
      } else if (!Number.isFinite(displayOrder)) {
        reason = "Display Order must be a number";
      } else if (seenSlugs.has(slug)) {
        reason = `Duplicate Slug in Excel: ${slug}`;
      } else if (code && seenCodes.has(code)) {
        reason = `Duplicate Code in Excel: ${code}`;
      }

      // Resolve stream names to MongoDB ObjectIds
      const missingStreams = streamNames.filter(
        (streamName) =>
          !streamMap.has(streamName.toLowerCase())
      );

      if (!reason && missingStreams.length) {
        reason = `Stream not found: ${missingStreams.join(", ")}`;
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

      const degree = {
        name,
        shortName,
        slug,
        level,
        degreeType,
        description,
        streams: streamNames.map((streamName) =>
          streamMap.get(streamName.toLowerCase())
        ),
        status,
        displayOrder,
      };

      // Code is optional in the Degree schema
      if (code) {
        degree.code = code;
      }

      // Save duration only when supplied
      if (hasDuration) {
        degree.defaultDuration = {
          value: durationValue,
          unit: durationUnit,
        };
      }

      // Auth middleware may provide the logged-in user ID
      if (req.user && req.user.id) {
        degree.createdBy = req.user.id;
      }

      degrees.push({
        excelRow,
        data: degree,
      });
    });

    if (!degrees.length) {
      return res.status(422).json({
        status: false,
        message: "No valid degree records found",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // 6. Check existing Slugs and Codes in MongoDB
    const conditions = [
      {
        slug: {
          $in: degrees.map((item) => item.data.slug),
        },
      },
    ];

    const codes = degrees
      .map((item) => item.data.code)
      .filter(Boolean);

    if (codes.length) {
      conditions.push({
        code: {
          $in: codes,
        },
      });
    }

    const existingDegrees = await Degree.find({
      $or: conditions,
    })
      .select("slug code")
      .lean();

    const existingSlugs = new Set(
      existingDegrees.map((item) => item.slug)
    );

    const existingCodes = new Set(
      existingDegrees
        .map((item) => item.code)
        .filter(Boolean)
        .map((item) => item.toUpperCase())
    );

    const newDegrees = [];

    degrees.forEach(({ excelRow, data }) => {
      if (existingSlugs.has(data.slug)) {
        skipped.push({
          row: excelRow,
          reason: `Slug already exists: ${data.slug}`,
        });
      } else if (data.code && existingCodes.has(data.code)) {
        skipped.push({
          row: excelRow,
          reason: `Code already exists: ${data.code}`,
        });
      } else {
        newDegrees.push(data);
      }
    });

    if (!newDegrees.length) {
      return res.status(200).json({
        status: true,
        message: "No new degrees to import",
        importedCount: 0,
        skippedCount: skipped.length,
        skipped,
      });
    }

    // 7. Insert degrees into MongoDB
    const result = await Degree.insertMany(newDegrees, {
      ordered: true,
    });

    // 8. Upload Excel file to Cloudinary
    let cloudinaryUrl = null;
    let cloudinaryMessage = "Excel uploaded successfully";

    try {
      const uploadResult = await new Promise(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder: "degrees",
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
    } catch (uploadError) {
      // Degrees are already saved, so report import success
      // even if the separate Cloudinary upload fails.
      console.error(
        "Degree Excel Cloudinary upload failed:",
        uploadError
      );

      cloudinaryMessage =
        "Degrees imported, but Excel upload to Cloudinary failed";
    }

    // 9. Send response
    return res.status(201).json({
      status: true,
      message: "Degree bulk import completed",
      importedCount: result.length,
      skippedCount: skipped.length,
      skipped,
      cloudinaryUrl,
      cloudinaryMessage,
    });
  } catch (error) {
    console.error("Bulk Degree Import Error:", error);

    return res.status(500).json({
      status: false,
      message: "Degree bulk import failed",
      error: error.message,
    });
  }
};

module.exports = {
  bulkImportDegrees,
};
