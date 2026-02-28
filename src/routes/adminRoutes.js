const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getDoctorActivities,
    getDashboardAnalytics,
    getActivityLogs
} = require('../controllers/adminController');
const { protect, admin, adminOrReceptionist } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Admin-only routes
router.get('/users', admin, getAllUsers);
router.put('/users/:userId/status', admin, updateUserStatus);
router.put('/users/:userId/role', admin, updateUserRole);
router.delete('/users/:userId', admin, deleteUser);

// Admin and Receptionist can access
router.get('/doctor-activities', adminOrReceptionist, getDoctorActivities);
router.get('/analytics', adminOrReceptionist, getDashboardAnalytics);
router.get('/activity-logs', adminOrReceptionist, getActivityLogs);

module.exports = router;
