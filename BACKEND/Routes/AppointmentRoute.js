const express = require("express");
const router = express.Router();

const auth = require("../Auth");

const {
  scheduleAppointment,
  getAllAppointments,
  getMyAppointments,
  getAppointmentById,
  confirmAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  markNoShow,
} = require("../CONTROLLERS/AppointmentController");

// Schedule appointment
router.post("/schedule", auth, scheduleAppointment);

// Get appointments
router.get("/all", auth, getAllAppointments);
router.get("/my-appointments", auth, getMyAppointments);

// Appointment actions
router.patch("/confirm/:id", auth, confirmAppointment);
router.patch("/reschedule/:id", auth, rescheduleAppointment);
router.patch("/cancel/:id", auth, cancelAppointment);
router.patch("/complete/:id", auth, completeAppointment);
router.patch("/no-show/:id", auth, markNoShow);

// Get appointment by ID
router.get("/:id", auth, getAppointmentById);

module.exports = router;