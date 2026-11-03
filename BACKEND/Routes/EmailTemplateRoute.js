const express = require("express");

const router = express.Router();

const {
createEmailTemplate,
getEmailTemplates,
updateEmailTemplate,
deleteEmailTemplate,
} = require("../CONTROLLERS/EmailController");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// CREATE
router.post(
"/",
Auth,
Permission("emailTemplates.add"),
createEmailTemplate
);

// GET ALL
router.get(
"/",
Auth,
Permission("emailTemplates.view"),
getEmailTemplates
);

// UPDATE
router.put(
"/:id",
Auth,
Permission("emailTemplates.edit"),
updateEmailTemplate
);

// DELETE
router.delete(
"/:id",
Auth,
Permission("emailTemplates.delete"),
deleteEmailTemplate
);

module.exports = router;
