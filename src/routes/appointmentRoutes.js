const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus, bookAppointment, cancelAppointment, getDoctors } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Get available doctors (for patient booking)
router.get('/doctors', protect, getDoctors);

// Patient booking their own appointment
router.post('/book', protect, authorize('Patient'), bookAppointment);

// Cancel appointment (Patient can cancel their own)
router.put('/:id/cancel', protect, cancelAppointment);

router.route('/')
    .post(protect, authorize('Admin', 'Receptionist', 'Doctor'), createAppointment)
    .get(protect, getAppointments);

router.route('/:id')
    .put(protect, authorize('Admin', 'Receptionist', 'Doctor'), updateAppointmentStatus);

module.exports = router;
