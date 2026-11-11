const CounsellingRequest = require("../Models/CounsellingRequest");

// Update counselling workflow stage
exports.updateWorkflowStage = async (req, res) => {
  try {
    const { requestId, stageId } = req.params;
    const { status, remarks } = req.body;

    // Validate status
    const allowedStatuses = ["pending", "in_progress", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workflow status",
      });
    }

    // Find counselling request
    const request = await CounsellingRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

    // Find selected workflow stage
    const stage = request.workflowStages.find(
      (item) => item.id === stageId
    );

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Workflow stage not found",
      });
    }

    // Update stage
    stage.status = status;

    if (status === "completed") {
      stage.completedAt = new Date();
    } else {
      stage.completedAt = null;
    }

    // Update remarks if provided
    if (remarks !== undefined) {
      stage.remarks = remarks;
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Workflow stage updated successfully",
      workflowStages: request.workflowStages,
    });

  } catch (error) {
    console.error("Update Workflow Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update workflow stage",
      error: error.message,
    });
  }
};


// Get workflow stages of a counselling request
exports.getWorkflowStages = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await CounsellingRequest.findById(requestId)
      .select("requestNumber student workflowStages");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

    return res.status(200).json({
      success: true,
      workflowStages: request.workflowStages,
    });

  } catch (error) {
    console.error("Get Workflow Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workflow stages",
      error: error.message,
    });
  }
};