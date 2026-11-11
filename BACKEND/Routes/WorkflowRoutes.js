const express = require("express");
const router = express.Router();

const {
  updateWorkflowStage,
  getWorkflowStages,
} = require("../CONTROLLERS/WorkflowController");

const Auth = require("../Auth");

// Only Super Admin can manage workflow
function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "Super Admin") {
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can manage workflow",
    });
  }

  next();
}

// Get workflow stages
router.get("/:requestId", Auth, requireSuperAdmin, getWorkflowStages);

// Update workflow stage
router.put("/:requestId/:stageId", Auth, requireSuperAdmin, updateWorkflowStage);

module.exports = router;