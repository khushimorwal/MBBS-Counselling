const StudentProfile = require("../Models/StudentProfile");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");

// ======================================================
// ALLOWED PROFILE FIELDS
// Only these fields can be updated through the profile API.
// This prevents unwanted fields from being modified.
// ======================================================

const allowedFields = [
  "dob",
  "gender",
  "city",
  "state",
  "country",
  "academicDetails",
  "entranceExams",
  "preferredLocations",
  "preferredLocationDetails",
  "preferredCourses",
  "preferredCourseDetails",
  "budget",
];

// ======================================================
// FLATTEN NESTED OBJECT
// Converts nested objects into MongoDB dot notation.
//
// Example:
// { budget: { annualBudget: 500000 } }
//
// Becomes:
// { "budget.annualBudget": 500000 }
//
// This allows partial updates without overwriting
// other existing nested fields.
// ======================================================

const flattenObject = (obj, parentKey = "", result = {}) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    const newKey = parentKey
      ? `${parentKey}.${key}`
      : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  });

  return result;
};

// ======================================================
// GET STUDENT PROFILE
// Fetches the profile of the currently logged-in student.
// ======================================================

const getStudentProfile = async (req, res) => {
  try {
    // Find profile using authenticated user's ID.
    const profile = await StudentProfile.findOne({
      user: req.user.id,
    }).populate("user", "name email");

    // Return a successful response if profile is not created.
    if (!profile) {
      return res.status(200).json({
        success: true,
        message: "Student profile not created yet",
        profile: null,
      });
    }

    // Populate existing database references.
    await profile.populate("entranceExams.exam");
    await profile.populate("preferredCourses");

    return res.status(200).json({
      success: true,
      message: "Student profile fetched successfully",
      profile,
    });
  } catch (error) {
    console.log("Get Student Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching student profile",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE OR UPDATE STUDENT PROFILE
// Creates a new profile if it does not exist.
// Otherwise, updates only the fields provided by the student.
// ======================================================

const saveStudentProfile = async (req, res) => {
  try {
    // Prepare update object with authenticated user's details.
    const updateData = {
      name: req.user.name,
      email: req.user.email,
    };

    // Process only fields included in the allowedFields list.
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        const value = req.body[field];

        // Flatten nested academic and budget objects.
        // Array fields are kept intact.
        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          flattenObject(value, field, updateData);
        } else {
          updateData[field] = value;
        }
      }
    });

    // Stop if no valid profile information was provided.
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one valid profile field",
      });
    }

    // Create or update the profile using the logged-in user's ID.
    const profile = await StudentProfile.findOneAndUpdate(
      {
        user: req.user.id,
      },
      {
        $set: updateData,

        // Set user reference only when creating a new profile.
        $setOnInsert: {
          user: req.user.id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // Populate references before returning the profile.
    await profile.populate("user", "name email");
    await profile.populate("entranceExams.exam");
    await profile.populate("preferredCourses");

    return res.status(200).json({
      success: true,
      message: "Student profile saved successfully",
      profile,
    });
  } catch (error) {
    console.log("Save Student Profile Error:", error);

    // Return 400 for Mongoose validation errors.
    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error saving student profile",
      error: error.message,
    });
  }
};

// ======================================================
// UPLOAD PROFILE IMAGE
// Uploads the student's profile image to Cloudinary.
// Deletes the previous image after successful upload.
// ======================================================

const uploadProfileImage = async (req, res) => {
  try {
    // Check whether the student selected an image.
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    // Find the existing student profile.
    let profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    // Create profile if it does not exist.
    if (!profile) {
      profile = new StudentProfile({
        user: req.user.id,
        name: req.user.name,
        email: req.user.email,
      });
    } else {
      // Keep student account details synchronized.
      profile.name = req.user.name;
      profile.email = req.user.email;
    }

    // Upload image buffer to Cloudinary using upload_stream.
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "mbbs-counselling/student-profiles",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      streamifier
        .createReadStream(req.file.buffer)
        .pipe(stream);
    });

    // Delete previous image only after new upload succeeds.
    if (profile.profileImage?.public_id) {
      await cloudinary.uploader.destroy(
        profile.profileImage.public_id
      );
    }

    // Save new Cloudinary image information.
    profile.profileImage = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: profile.profileImage,
    });
  } catch (error) {
    console.log("Profile Image Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error uploading profile image",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORT CONTROLLER FUNCTIONS
// ======================================================

module.exports = {
  getStudentProfile,
  saveStudentProfile,
  uploadProfileImage,
};