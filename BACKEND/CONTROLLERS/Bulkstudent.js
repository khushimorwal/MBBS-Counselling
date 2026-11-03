const cloudinary = require("../config/cloudnary");
const xlsx = require('xlsx');
const Student = require("../Models/StudentSchma");

const uploadExcelToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "student_excel",
        public_id: `students_${Date.now()}.xlsx`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

const readExcelFile = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const students = xlsx.utils.sheet_to_json(worksheet);

  return students;
};



const validateStudents = (students) => {
  const validStudents = [];
  const errors = [];

  students.forEach((student, index) => {
    const { name, email, phone } = student;

    if (!name || !email || !phone) {
      errors.push({
        row: index + 2,
        message: "Name, email and phone are required",
      });
    } else {
      validStudents.push({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
      });
    }
  });

  return { validStudents, errors };
};

const saveStudentsToDB = async (students) => {
  const validStudents = [];
  const errors = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    const existingStudent = await Student.findOne({
      email: student.email,
    });

    if (existingStudent) {
      errors.push({
        email: student.email,
        message: "Email already exists",
      });
    } else {
      validStudents.push(student);
    }
  }

  if (validStudents.length > 0) {
    await Student.insertMany(validStudents);
  }

  return {
    importedCount: validStudents.length,
    errors,
  };
};

const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an XLSX file",
      });
    }

    // 1. Upload Excel file to Cloudinary
    const cloudinaryResult = await uploadExcelToCloudinary(req.file);

    // 2. Read Excel data
    const students = readExcelFile(req.file.buffer);

    // 3. Validate Excel data
    const { validStudents, errors: validationErrors } =
      validateStudents(students);

    // 4. Save valid students in MongoDB
    const result = await saveStudentsToDB(validStudents);

    res.status(200).json({
      success: true,
      message: "Bulk import completed",
      importedCount: result.importedCount,
      errors: [...validationErrors, ...result.errors],
      cloudinaryUrl: cloudinaryResult.secure_url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { uploadExcelToCloudinary, 
    readExcelFile, 
    validateStudents, 
    saveStudentsToDB, 
    bulkImportStudents };
