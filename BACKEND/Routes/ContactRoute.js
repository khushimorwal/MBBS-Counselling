
const express = require("express");
const router = express.Router();
const Contact = require("../Models/Contact");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit your message",
    });
  }
});

module.exports = router;

