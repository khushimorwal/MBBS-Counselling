const StudentProfile = require("../Models/StudentProfile");
const cloudinary = require("../config/cloudnary");
const streamifier = require("streamifier");

const allowedDocuments = [
  "Passport Size Photo",
  "Signature",
  "10th Marksheet",
  "12th Marksheet",
  "NEET Scorecard",
  "Identity Proof",
];

// Upload Student Document
const uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file",
      });
    }

    if (!allowedDocuments.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type",
      });
    }

    let profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      profile = new StudentProfile({
        user: req.user.id,
        name: req.user.name,
        email: req.user.email,
      });
    }

    // Upload file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "mbbs-counselling/student-documents",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier
        .createReadStream(req.file.buffer)
        .pipe(uploadStream);
    });

    // Check existing document
    const existingDocument = profile.documents.find(
      (doc) => doc.documentType === documentType
    );

    // Delete previous Cloudinary file
    if (existingDocument?.public_id) {
      await cloudinary.uploader.destroy(
        existingDocument.public_id,
        {
          resource_type: existingDocument.resourceType || "image",
        }
      );
    }

    const newDocument = {
      documentType,
      fileName: req.file.originalname,
      public_id: result.public_id,
      url: result.secure_url,
      resourceType: result.resource_type,
      status: "Pending",
      uploadedAt: new Date(),
    };

    if (existingDocument) {
      existingDocument.set(newDocument);
    } else {
      profile.documents.push(newDocument);
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      documents: profile.documents,
    });
  } catch (error) {
    console.error("Upload Document Error:", error);

    res.status(500).json({
      success: false,
      message: "Document upload failed",
    });
  }
};


// Get Student Documents
const getDocuments = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      documents: profile?.documents || [],
    });
  } catch (error) {
    console.error("Get Documents Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch documents",
    });
  }
};


// Delete Student Document
const deleteDocument = async (req, res) => {
  try {
    const { documentType } = req.params;

    const profile = await StudentProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const document = profile.documents.find(
      (doc) => doc.documentType === documentType
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.public_id) {
      await cloudinary.uploader.destroy(
        document.public_id,
        {
          resource_type: document.resourceType || "image",
        }
      );
    }

    profile.documents = profile.documents.filter(
      (doc) => doc.documentType !== documentType
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      documents: profile.documents,
    });
  } catch (error) {
    console.error("Delete Document Error:", error);

    res.status(500).json({
      success: false,
      message: "Document deletion failed",
    });
  }
};

// Update Document Status (Admin)
const updateDocumentStatus = async (req, res) => {
  try {
    const { userId, documentType, status } = req.body;

    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document status",
      });
    }

    const profile = await StudentProfile.findOne({
      user: userId,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const document = profile.documents.find(
      (doc) => doc.documentType === documentType
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    document.status = status;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: `Document ${status.toLowerCase()} successfully`,
      document,
    });
  } catch (error) {
    console.error("Update Document Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update document status",
    });
  }
};

// Get All Students' Documents (Admin)
const getAllStudentDocuments = async (req, res) => {
  try {
    const profiles = await StudentProfile.find({
      "documents.0": { $exists: true },
    }).populate("user", "name email");

    return res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Get All Student Documents Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student documents",
    });
  }
};


module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
  updateDocumentStatus,
  getAllStudentDocuments
};