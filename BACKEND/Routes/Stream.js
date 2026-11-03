const express = require("express");
const router = express.Router();

const upload = require("../Middleware/uploadExcel");

const {
  bulkImportStreams,
} = require("../CONTROLLERS/BulkStream");

const {
createStream,
getStreams,
updateStream,
deleteStream,
} = require("../CONTROLLERS/StreamControllers");

const Auth = require("../Auth");
const Permission = require("../Middleware/Permission");

// Bulk Import Streams
router.post(
  "/streams/bulk-import",
  Auth,
  Permission("streams.add"),
  upload.single("file"),
  bulkImportStreams
);

// Create Stream
router.post(
"/streams",
Auth,
Permission("streams.add"),
createStream
);

// View Streams
router.get(
"/streams",
Auth,
Permission("streams.view"),
getStreams
);

// Update Stream
router.put(
"/streams/:id",
Auth,
Permission("streams.edit"),
updateStream
);

// Delete Stream
router.delete(
"/streams/:id",
Auth,
Permission("streams.delete"),
deleteStream
);

module.exports = router;
