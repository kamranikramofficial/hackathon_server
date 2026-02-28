const mongoose = require('mongoose');

const diagnosisLogSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: { type: [String], required: true },
    aiResponse: { type: String, required: true }, // The raw or formatted output from the AI
    riskLevel: {
        type: String,
        enum: ['Low', 'Moderate', 'High', 'Unknown'],
        default: 'Unknown'
    }
}, { timestamps: true });

module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);
