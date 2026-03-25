const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const generatePrescriptionPDF = require('../utils/generatePDF');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
    try {
        const { patientId, medicines, instructions } = req.body;
        const doctorId = req.user._id;

        const prescription = await Prescription.create({
            patientId,
            doctorId,
            medicines,
            instructions
        });

        // Generate PDF
        const patient = await Patient.findById(patientId);
        const doctor = await User.findById(doctorId);

        const pdfUrl = await generatePrescriptionPDF(prescription, patient, doctor);

        prescription.pdfUrl = pdfUrl;
        await prescription.save();

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
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
        // Admin and Receptionist get all prescriptions

        const prescriptions = await Prescription.find(query).lean()
            .populate('patientId', 'name')
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });

        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPrescription,
    getPrescriptions
};
