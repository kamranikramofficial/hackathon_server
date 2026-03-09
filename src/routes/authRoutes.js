const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getDoctors, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.get('/doctors', protect, getDoctors);

module.exports = router;
