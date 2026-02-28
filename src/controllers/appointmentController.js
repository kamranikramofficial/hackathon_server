const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

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
            // Patient needs their own patient ID mapping if patient login is strict, but usually patients are created by Receptionist. 
            // In a strict setup, you would map req.user._id to a Patient model _id. For now returning all if Admin/Receptionist, or specific if Doctor.
            return res.status(403).json({ message: 'Patient direct access requires user-to-patient mapping' });
        } else if (req.user.role === 'Doctor') {
            query.doctorId = req.user._id;
        }

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name contact')
            .populate('doctorId', 'name email')
            .sort({ date: 1 });

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
    updateAppointmentStatus
};
