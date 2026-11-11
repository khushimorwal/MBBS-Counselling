const mongoose = require("mongoose");

// ======================================================
// STUDENT PROFILE SCHEMA
// Stores personal, academic, counselling and preference
// details of an individual student.
// ======================================================

const studentProfileSchema = new mongoose.Schema(
  {
    // Reference to the registered student account.
    // Each user can have only one student profile.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic student information.
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ======================================================
    // PERSONAL DETAILS
    // ======================================================

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    city: String,
    state: String,
    country: String,

    // ======================================================
    // ACADEMIC DETAILS
    // Stores 10th, 12th and Graduation information.
    // ======================================================

    academicDetails: {
      tenth: {
        board: String,
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        passingYear: Number,
      },

      twelfth: {
        board: String,
        stream: String,
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        passingYear: Number,
      },

      graduation: {
        college: String,
        course: String,
        percentage: {
          type: Number,
          min: 0,
          max: 100,
        },
        passingYear: Number,
      },
    },

    // ======================================================
    // PROFILE IMAGE
    // Stores Cloudinary image information.
    // ======================================================

    profileImage: {
      public_id: String,
      url: String,
    },

    // ======================================================
    // STUDENT DOCUMENTS
    // Stores uploaded documents and their verification status.
    // ======================================================

    documents: [
      {
        documentType: {
          type: String,
          required: true,
        },

        fileName: String,
        public_id: String,
        resourceType: String,
        url: String,

        status: {
          type: String,
          enum: ["Pending", "Verified", "Rejected"],
          default: "Pending",
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ======================================================
    // ENTRANCE EXAMS
    // Supports multiple entrance exam records per student.
    // Old exam reference and fields are preserved.
    // ======================================================

    entranceExams: [
      {
        // Existing reference to the EntranceExam collection.
        exam: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "EntranceExam",
        },

        // Exam details entered by the student.
        examName: {
          type: String,
          trim: true,
        },

        examYear: Number,
        rollNumber: String,

        // Score obtained in the examination.
        score: Number,

        percentile: Number,

        // Rank information.
        rank: Number,
        air: Number,
        categoryRank: Number,

        // Examination result status.
        status: {
          type: String,
          enum: ["Qualified", "Not Qualified", "Result Awaited"],
        },

        year: Number,
      },
    ],

    // ======================================================
    // PREFERRED LOCATIONS
    // Existing string array is preserved for compatibility.
    // New structured location preferences are stored separately.
    // ======================================================

    preferredLocations: [String],

    preferredLocationDetails: [
      {
        country: {
          type: String,
          default: "India",
        },

        state: String,
        city: String,

        // Student's preferred college ownership type.
        locationType: {
          type: String,
          enum: ["Government", "Private", "Both"],
        },

        priority: {
          type: String,
          enum: [
            "1st Preference",
            "2nd Preference",
            "3rd Preference",
            "4th Preference",
            "5th Preference",
          ],
        },
      },
    ],

    // ======================================================
    // PREFERRED COURSES
    // Existing Course references are preserved.
    // New course preferences are stored separately.
    // ======================================================

    preferredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    preferredCourseDetails: [
      {
        courseName: {
          type: String,
          required: true,
          trim: true,
        },

        courseType: String,
        specialization: String,

        priority: {
          type: String,
          enum: [
            "1st Preference",
            "2nd Preference",
            "3rd Preference",
            "4th Preference",
            "5th Preference",
          ],
        },
      },
    ],

    // ======================================================
    // BUDGET DETAILS
    // Existing min/max fields are preserved.
    // New fields match the student dashboard budget form.
    // ======================================================

    budget: {
      // Existing budget range fields.
      min: {
        type: Number,
        min: 0,
      },

      max: {
        type: Number,
        min: 0,
      },

      // Preferred college budget category.
      budgetType: {
        type: String,
        enum: [
          "Government College Budget",
          "Private College Budget",
          "Both",
        ],
      },

      // Annual expense breakdown (amounts in INR).
      annualBudget: {
        type: Number,
        min: 0,
      },

      tuitionBudget: {
        type: Number,
        min: 0,
      },

      hostelBudget: {
        type: Number,
        min: 0,
      },

      livingBudget: {
        type: Number,
        min: 0,
      },

      otherBudget: {
        type: Number,
        min: 0,
      },

      // Scholarship and financial assistance preferences.
      scholarship: {
        type: String,
        enum: ["Yes", "No", "Maybe"],
      },

      financialSupport: {
        type: String,
        enum: [
          "Self Funded",
          "Parents / Family",
          "Education Loan",
          "Scholarship",
          "Other",
        ],
      },
    },
  },

  {
    // Automatically maintains createdAt and updatedAt.
    timestamps: true,
  }
);

// ======================================================
// MODEL EXPORT
// Reuses the existing model if it has already been compiled.
// ======================================================

module.exports =
  mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);