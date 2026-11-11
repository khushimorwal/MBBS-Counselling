const Contact = require("../Models/Contact");

// Submit Contact Form
const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const newContact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully!",
      contact: newContact,
    });
  } catch (error) {
    console.error("Contact submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit your message",
    });
  }
};

// Get All Contact Inquiries
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact inquiries",
    });
  }
};

module.exports = {
  createContact,
  getContacts,
};