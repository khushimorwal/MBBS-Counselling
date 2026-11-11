const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only JPG, PNG and PDF files are allowed"),
        false
      );
    }
  },
});

// Verify real file type from magic bytes (client mimetype can be spoofed).
const startsWith = (buf, bytes) =>
  buf.length >= bytes.length && bytes.every((b, i) => buf[i] === b);

const isAllowedContent = (buf) =>
  startsWith(buf, [0xff, 0xd8, 0xff]) || // JPEG
  startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) || // PNG
  startsWith(buf, [0x25, 0x50, 0x44, 0x46]); // PDF

const verifyContent = (req, res, next) => {
  if (req.file && !isAllowedContent(req.file.buffer)) {
    return res.status(400).json({
      status: false,
      message: "File content does not match an allowed type",
    });
  }
  next();
};

const originalSingle = upload.single.bind(upload);
upload.single = (field) => [originalSingle(field), verifyContent];

module.exports = upload;