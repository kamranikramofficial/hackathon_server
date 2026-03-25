const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Get available doctors
// @route   GET /api/appointments/doctors
// @access  Private
const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'Doctor', status: 'active' }).lean()
            .select('name email specialization')
            .sort({ name: 1 });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Patient books their own appointment
// @route   POST /api/appointments/book
// @access  Private (Patient)
const bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, reason } = req.body;

        // Find or create patient record for this user
        let patient = await Patient.findOne({ userId: req.user._id });
        
        if (!patient) {
            // Create a patient record linked to this user
            patient = await Patient.create({
                name: req.user.name,
                age: 0, // Will be updated by profile
                gender: 'Other', // Will be updated by profile
                contact: req.user.phone || req.user.email,
                userId: req.user._id,
                createdBy: req.user._id
            });
        }

        // Validate doctor exists
        const doctor = await User.findOne({ _id: doctorId, role: 'Doctor', status: 'active' });
        if (!doctor) {
            return res.status(400).json({ message: 'Selected doctor is not available' });
        }

        const appointment = await Appointment.create({
            patientId: patient._id,
            doctorId,
            date,
            reason: reason || '',
            status: 'pending'
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('doctorId', 'name email specialization');

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: populatedAppointment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel an appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Patients can only cancel their own appointments
        if (req.user.role === 'Patient') {
            const patient = await Patient.findOne({ userId: req.user._id });
            if (!patient || !appointment.patientId.equals(patient._id)) {
                return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
            }
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private (Doctor, Receptionist, Admin)
const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date } = req.body;

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all appointments (Admin/Receptionist) or user-specific (Doctor/Patient)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'Patient') {
            // Find patient record linked to this user
            const patient = await Patient.findOne({ userId: req.user._id });
            if (!patient) {
                // No patient record yet - return empty array
                return res.json([]);
            }
            query.patientId = patient._id;
        } else if (req.user.role === 'Doctor') {
            query.doctorId = req.user._id;
        }
        // Admin and Receptionist get all appointments

        const appointments = await Appointment.find(query).lean()
            .populate('patientId', 'name contact')
            .populate('doctorId', 'name email specialization')
            .sort({ date: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private (Doctor, Receptionist, Admin)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status || appointment.status;
        const updatedAppointment = await appointment.save();

        res.json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    updateAppointmentStatus,
    bookAppointment,
    cancelAppointment,
    getDoctors
};
