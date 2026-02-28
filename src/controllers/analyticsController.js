const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const DiagnosisLog = require('../models/DiagnosisLog');

// @desc    Get system analytics
// @route   GET /api/analytics
// @access  Private (Admin, Doctor)
const getAnalytics = async (req, res) => {
    try {
        let doctorMatch = {};
        if (req.user.role === 'Doctor') {
            doctorMatch.doctorId = req.user._id;
        }

        const totalPatients = await Patient.countDocuments();
        const totalAppointments = await Appointment.countDocuments(doctorMatch);
        const pendingAppointments = await Appointment.countDocuments({ ...doctorMatch, status: 'pending' });
        const completedAppointments = await Appointment.countDocuments({ ...doctorMatch, status: 'completed' });

        // Aggregate top simulated diagnoses
        const diagnosisStats = await DiagnosisLog.aggregate([
            { $match: doctorMatch },
            { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
        ]);

        const totalDoctors = await User.countDocuments({ role: 'Doctor' });

        res.json({
            patients: totalPatients,
            appointments: {
                total: totalAppointments,
                pending: pendingAppointments,
                completed: completedAppointments
            },
            diagnosisStats,
            totalDoctors: req.user.role === 'Admin' ? totalDoctors : undefined,
            simulatedRevenue: totalAppointments * 50 // Mock logic: $50 per appointment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAnalytics };
