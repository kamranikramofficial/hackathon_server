const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const DiagnosisLog = require('../models/DiagnosisLog');

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist, Doctor)
const createPatient = async (req, res) => {
    try {
        const { name, age, gender, contact } = req.body;
        const patient = await Patient.create({
            name,
            age,
            gender,
            contact,
            createdBy: req.user._id
        });
        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({}).sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient timeline (History)
// @route   GET /api/patients/:id/timeline
// @access  Private
const getPatientTimeline = async (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const appointments = await Appointment.find({ patientId }).sort({ date: -1 }).populate('doctorId', 'name');
        const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 }).populate('doctorId', 'name');
        const diagnoses = await DiagnosisLog.find({ patientId }).sort({ createdAt: -1 }).populate('doctorId', 'name');

        res.json({
            patient,
            timeline: {
                appointments,
                prescriptions,
                diagnoses
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get CURRENT user's patient timeline
// @route   GET /api/patients/me/timeline
// @access  Private (Patient)
const getMyTimeline = async (req, res) => {
    try {
        // First try to find patient by userId
        let patient = await Patient.findOne({ userId: req.user._id });
        
        // If no patient found by userId, try to find by email match in contact
        if (!patient) {
            patient = await Patient.findOne({ 
                $or: [
                    { contact: req.user.email },
                    { name: req.user.name }
                ]
            });
        }
        
        // If still no patient, return empty timeline
        if (!patient) {
            return res.json({
                patient: null,
                timeline: {
                    appointments: [],
                    prescriptions: [],
                    diagnoses: []
                }
            });
        }

        const patientId = patient._id;
        const appointments = await Appointment.find({ patientId }).sort({ date: -1 }).populate('doctorId', 'name');
        const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 }).populate('doctorId', 'name');
        const diagnoses = await DiagnosisLog.find({ patientId }).sort({ createdAt: -1 }).populate('doctorId', 'name');

        res.json({
            patient,
            timeline: {
                appointments,
                prescriptions,
                diagnoses
            }
        });
    } catch (error) {
        console.error('Error in getMyTimeline:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPatient,
    getPatients,
    getPatientTimeline,
    getMyTimeline
};
