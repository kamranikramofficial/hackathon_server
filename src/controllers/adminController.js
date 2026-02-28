const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const DiagnosisLog = require('../models/DiagnosisLog');

// Get all users with filters
const getAllUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        
        let query = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        const users = await User.find(query)
            .select('-passwordHash')
            .sort({ createdAt: -1 });
            
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Update user status (active/blocked/suspended)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        
        if (!['active', 'blocked', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be active, blocked, or suspended' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent blocking yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own status' });
        }
        
        user.status = status;
        user.statusUpdatedAt = new Date();
        user.statusUpdatedBy = req.user.id;
        await user.save();
        
        res.json({ 
            message: `User status updated to ${status}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
};

// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        // Only allow changing to Doctor, Receptionist, Patient (not Admin)
        if (!['Doctor', 'Receptionist', 'Patient'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Can only change to Doctor, Receptionist, or Patient' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent changing your own role
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }
        
        // Prevent changing Admin user's role
        if (user.role === 'Admin') {
            return res.status(400).json({ message: 'Cannot change Admin user role' });
        }
        
        user.role = role;
        await user.save();
        
        res.json({ 
            message: `User role updated to ${role}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        
        // Soft delete - just mark as deleted
        user.status = 'deleted';
        user.deletedAt = new Date();
        user.deletedBy = req.user.id;
        await user.save();
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Get all doctors with their activity stats
const getDoctorActivities = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'Doctor', status: { $ne: 'deleted' } })
            .select('-passwordHash');
        
        const doctorActivities = await Promise.all(doctors.map(async (doctor) => {
            const [appointments, prescriptions, diagnoses] = await Promise.all([
                Appointment.countDocuments({ doctorId: doctor._id }),
                Prescription.countDocuments({ doctorId: doctor._id }),
                DiagnosisLog.countDocuments({ doctorId: doctor._id })
            ]);
            
            // Get today's appointments
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const todayAppointments = await Appointment.countDocuments({
                doctorId: doctor._id,
                date: { $gte: today, $lt: tomorrow }
            });
            
            const completedToday = await Appointment.countDocuments({
                doctorId: doctor._id,
                date: { $gte: today, $lt: tomorrow },
                status: 'completed'
            });
            
            // Get recent activity
            const recentAppointments = await Appointment.find({ doctorId: doctor._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('patientId', 'name');
            
            return {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                status: doctor.status || 'active',
                specialization: doctor.specialization || 'General',
                stats: {
                    totalAppointments: appointments,
                    totalPrescriptions: prescriptions,
                    totalDiagnoses: diagnoses,
                    todayAppointments,
                    completedToday
                },
                recentActivity: recentAppointments.map(apt => ({
                    type: 'appointment',
                    patientName: apt.patientId?.name || 'Unknown',
                    status: apt.status,
                    date: apt.date
                })),
                createdAt: doctor.createdAt
            };
        }));
        
        res.json(doctorActivities);
    } catch (error) {
        console.error('Error fetching doctor activities:', error);
        res.status(500).json({ message: 'Error fetching doctor activities', error: error.message });
    }
};

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
    try {
        const [
            totalUsers,
            totalPatients,
            totalAppointments,
            totalPrescriptions,
            totalDiagnoses
        ] = await Promise.all([
            User.countDocuments({ status: { $ne: 'deleted' } }),
            Patient.countDocuments(),
            Appointment.countDocuments(),
            Prescription.countDocuments(),
            DiagnosisLog.countDocuments()
        ]);
        
        // Users by role
        const usersByRole = await User.aggregate([
            { $match: { status: { $ne: 'deleted' } } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        // Appointments by status
        const appointmentsByStatus = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        // Diagnoses by risk level
        const diagnosesByRisk = await DiagnosisLog.aggregate([
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);
        
        // Monthly trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyAppointments = await Appointment.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        
        const monthlyPatients = await Patient.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        
        res.json({
            totals: {
                users: totalUsers,
                patients: totalPatients,
                appointments: totalAppointments,
                prescriptions: totalPrescriptions,
                diagnoses: totalDiagnoses
            },
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
                acc[item._id || 'unknown'] = item.count;
                return acc;
            }, {}),
            diagnosesByRisk: diagnosesByRisk.reduce((acc, item) => {
                acc[item._id || 'unknown'] = item.count;
                return acc;
            }, {}),
            monthlyTrends: {
                appointments: monthlyAppointments,
                patients: monthlyPatients
            }
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
    try {
        const { limit = 50, type } = req.query;
        
        // Get recent appointments
        const recentAppointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        
        // Get recent prescriptions
        const recentPrescriptions = await Prescription.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        
        // Get recent diagnoses
        const recentDiagnoses = await DiagnosisLog.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('patientId', 'name')
            .populate('doctorId', 'name');
        
        // Combine and sort
        const activities = [
            ...recentAppointments.map(apt => ({
                type: 'appointment',
                action: `Appointment ${apt.status}`,
                patient: apt.patientId?.name || 'Unknown',
                doctor: apt.doctorId?.name || 'Unknown',
                date: apt.createdAt,
                details: { status: apt.status, appointmentDate: apt.date }
            })),
            ...recentPrescriptions.map(rx => ({
                type: 'prescription',
                action: 'Prescription created',
                patient: rx.patientId?.name || 'Unknown',
                doctor: rx.doctorId?.name || 'Unknown',
                date: rx.createdAt,
                details: { medicines: rx.medicines?.length || 0 }
            })),
            ...recentDiagnoses.map(dx => ({
                type: 'diagnosis',
                action: `AI Diagnosis - ${dx.riskLevel || 'Unknown'} risk`,
                patient: dx.patientId?.name || 'Unknown',
                doctor: dx.doctorId?.name || 'Unknown',
                date: dx.createdAt,
                details: { riskLevel: dx.riskLevel, symptoms: dx.symptoms }
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(limit));
        
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({ message: 'Error fetching activity logs', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getDoctorActivities,
    getDashboardAnalytics,
    getActivityLogs
};
