const mongoose = require("mongoose");

const CollegeRecommendation = require("../Models/CollegeRecommendation");
const CounsellingRequest = require("../Models/CounsellingRequest");
const CounsellingAssignment = require("../Models/CounsellingAssignment");
const College = require("../Models/College");

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const isAdmin = (req) =>
  ["Admin", "Super Admin"].includes(req.user.role);


// Check counsellor assignment
const checkCounsellorAssignment = async (
  counsellingRequest,
  counsellor
) => {
  return await CounsellingAssignment.findOne({
    counsellingRequest,
    counsellor,
    status: "active",
  });
};


// Populate recommendation
const populateRecommendation = (query) =>
  query
    .populate("student", "name email phone")
    .populate("counsellor", "name email")
    .populate("counsellingRequest", "requestNumber status")
    .populate("colleges.college");


// 1. Create Recommendation Draft
exports.createRecommendation = async (req, res) => {
  try {
    if (!["Counsellor", "Admin", "Super Admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const {
      counsellingRequest,
      colleges,
      counsellorNote,
    } = req.body;

    if (!isValidId(counsellingRequest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    if (!Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one college.",
      });
    }

    const request = await CounsellingRequest.findById(
      counsellingRequest
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found.",
      });
    }

    // Counsellor can only create recommendation for assigned student.
    if (req.user.role === "Counsellor") {
      const assignment = await checkCounsellorAssignment(
        counsellingRequest,
        req.user.id
      );

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "This student is not assigned to you.",
        });
      }
    }

    const collegeIds = colleges.map((item) =>
      typeof item === "object" ? item.college : item
    );

    // Validate college IDs
    if (collegeIds.some((id) => !isValidId(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID.",
      });
    }

    // Remove duplicate colleges
    const uniqueCollegeIds = [
      ...new Set(collegeIds.map((id) => id.toString())),
    ];

    const validColleges = await College.countDocuments({
      _id: { $in: uniqueCollegeIds },
    });

    if (validColleges !== uniqueCollegeIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more colleges do not exist.",
      });
    }

    const recommendationColleges = uniqueCollegeIds.map(
      (collegeId, index) => ({
        college: collegeId,
        priority: index + 1,
      })
    );

    const existingRecommendation =
      await CollegeRecommendation.findOne({
        counsellingRequest,
      });

    if (existingRecommendation) {
      if (existingRecommendation.status === "shared") {
        return res.status(400).json({
          success: false,
          message:
            "This recommendation has already been shared.",
        });
      }

      if (
        !isAdmin(req) &&
        existingRecommendation.counsellor.toString() !==
          req.user.id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied.",
        });
      }

      existingRecommendation.colleges =
        recommendationColleges;

      existingRecommendation.counsellorNote =
        counsellorNote || "";

      await existingRecommendation.save();

      const result = await populateRecommendation(
        CollegeRecommendation.findById(
          existingRecommendation._id
        )
      );

      return res.status(200).json({
        success: true,
        message: "Recommendation draft updated successfully.",
        data: result,
      });
    }

    const recommendation = await CollegeRecommendation.create({
      counsellingRequest,
      student: request.student,
      counsellor: req.user.id,
      colleges: recommendationColleges,
      counsellorNote: counsellorNote || "",
    });

    const result = await populateRecommendation(
      CollegeRecommendation.findById(recommendation._id)
    );

    return res.status(201).json({
      success: true,
      message: "Recommendation draft created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Create Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 2. Update Recommendation Draft
exports.updateRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { colleges, counsellorNote } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recommendation ID.",
      });
    }

    const recommendation =
      await CollegeRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found.",
      });
    }

    if (
      !isAdmin(req) &&
      !(
        req.user.role === "Counsellor" &&
        recommendation.counsellor.toString() ===
          req.user.id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (recommendation.status === "shared") {
      return res.status(400).json({
        success: false,
        message: "Shared recommendations cannot be edited.",
      });
    }

    if (colleges !== undefined) {
      if (!Array.isArray(colleges) || colleges.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one college.",
        });
      }

      const collegeIds = colleges.map((item) =>
        typeof item === "object" ? item.college : item
      );

      if (collegeIds.some((id) => !isValidId(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid college ID.",
        });
      }

      const uniqueIds = [
        ...new Set(collegeIds.map((id) => id.toString())),
      ];

      const validCount = await College.countDocuments({
        _id: { $in: uniqueIds },
      });

      if (validCount !== uniqueIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more colleges do not exist.",
        });
      }

      recommendation.colleges = uniqueIds.map(
        (collegeId, index) => ({
          college: collegeId,
          priority: index + 1,
        })
      );
    }

    if (counsellorNote !== undefined) {
      recommendation.counsellorNote = counsellorNote;
    }

    await recommendation.save();

    const result = await populateRecommendation(
      CollegeRecommendation.findById(id)
    );

    return res.status(200).json({
      success: true,
      message: "Recommendation updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Update Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 3. Share Recommendation With Student
exports.shareRecommendation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recommendation ID.",
      });
    }

    const recommendation =
      await CollegeRecommendation.findById(id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found.",
      });
    }

    if (
      !isAdmin(req) &&
      !(
        req.user.role === "Counsellor" &&
        recommendation.counsellor.toString() ===
          req.user.id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    if (recommendation.status === "shared") {
      return res.status(400).json({
        success: false,
        message: "Recommendation is already shared.",
      });
    }

    if (!recommendation.colleges.length) {
      return res.status(400).json({
        success: false,
        message: "Add colleges before sharing.",
      });
    }

    recommendation.status = "shared";
    recommendation.sharedAt = new Date();

    await recommendation.save();

    const result = await populateRecommendation(
      CollegeRecommendation.findById(id)
    );

    return res.status(200).json({
      success: true,
      message: "Recommendation shared with student successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Share Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 4. Get My Recommendations
exports.getMyRecommendations = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Counsellor") {
      filter.counsellor = req.user.id;
    } else if (req.user.role === "Student") {
      filter.student = req.user.id;
      filter.status = "shared";
    } else if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const recommendations = await populateRecommendation(
      CollegeRecommendation.find(filter).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json({
      success: true,
      total: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    console.error("Get Recommendations Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 5. Get Recommendation By Counselling Request
exports.getRecommendationByRequest = async (req, res) => {
  try {
    const { counsellingRequest } = req.params;

    if (!isValidId(counsellingRequest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID.",
      });
    }

    const recommendation = await populateRecommendation(
      CollegeRecommendation.findOne({
        counsellingRequest,
      })
    );

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: "Recommendation not found.",
      });
    }

    if (req.user.role === "Student") {
      if (
        recommendation.student._id.toString() !==
          req.user.id.toString() ||
        recommendation.status !== "shared"
      ) {
        return res.status(403).json({
          success: false,
          message: "Recommendation is not available.",
        });
      }
    } else if (req.user.role === "Counsellor") {
      const assignment = await checkCounsellorAssignment(
        counsellingRequest,
        req.user.id
      );

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "This student is not assigned to you.",
        });
      }
    } else if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error("Get Recommendation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};