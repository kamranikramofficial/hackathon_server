const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Admin', 'Receptionist', 'Doctor'), createAppointment)
    .get(protect, getAppointments);

router.route('/:id')
    .put(protect, authorize('Admin', 'Receptionist', 'Doctor'), updateAppointmentStatus);

module.exports = router;
