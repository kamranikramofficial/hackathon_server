const express = require('express');
const router = express.Router();
const { createPatient, getPatients, getPatientTimeline, getMyTimeline } = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('Admin', 'Receptionist', 'Doctor'), createPatient)
    .get(protect, authorize('Admin', 'Receptionist', 'Doctor'), getPatients);

// IMPORTANT: More specific routes must come before generic ones
router.get('/me/timeline', protect, getMyTimeline);
router.get('/:id/timeline', protect, authorize('Admin', 'Doctor'), getPatientTimeline);

module.exports = router;
