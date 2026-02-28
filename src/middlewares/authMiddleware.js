const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-passwordHash');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if user is blocked or deleted
            if (req.user.status === 'blocked' || req.user.status === 'deleted') {
                return res.status(403).json({ message: 'Your account has been blocked or deleted' });
            }

            if (req.user.status === 'suspended') {
                return res.status(403).json({ message: 'Your account has been suspended' });
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Admin only middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Admin or Receptionist middleware
const adminOrReceptionist = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Receptionist')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin or Receptionist only.' });
    }
};

// Doctor only middleware
const doctor = (req, res, next) => {
    if (req.user && req.user.role === 'Doctor') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
};

module.exports = { protect, authorize, admin, adminOrReceptionist, doctor };
