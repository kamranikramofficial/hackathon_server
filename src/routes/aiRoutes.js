const express = require('express');
const router = express.Router();
const { diagnoseSymptoms, getDiagnosisLogs, getHealthAdvice, analyzeReport } = require('../controllers/aiController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Doctor-only symptom diagnosis with logging
router.post('/diagnose', protect, authorize('Doctor'), diagnoseSymptoms);

// Diagnosis logs - Admin and Doctor
router.get('/logs', protect, authorize('Admin', 'Doctor'), getDiagnosisLogs);

// Health advice for all authenticated users
router.post('/health-advice', protect, getHealthAdvice);

// Report analysis for doctors and patients
router.post('/analyze-report', protect, authorize('Doctor', 'Patient'), analyzeReport);

module.exports = router;
