const DiagnosisLog = require('../models/DiagnosisLog');
const { getDiagnosticSuggestions } = require('../utils/aiHelper');

// @desc    Check symptoms with AI and log
// @route   POST /api/ai/diagnose
// @access  Private (Doctor)
const diagnoseSymptoms = async (req, res) => {
    try {
        const { patientId, symptoms } = req.body;
        const doctorId = req.user._id;

        // Handle symptoms as string or array
        let symptomsArray = symptoms;
        if (typeof symptoms === 'string') {
            symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s);
        }

        if (!symptomsArray || symptomsArray.length === 0) {
            return res.status(400).json({ message: 'Symptoms are required' });
        }

        // Call Gemini API wrapper
        const aiResponse = await getDiagnosticSuggestions(symptomsArray);

        // Only create log if patientId is provided
        let log = null;
        if (patientId) {
            log = await DiagnosisLog.create({
                patientId,
                doctorId,
                symptoms: symptomsArray,
                aiResponse: aiResponse.data,
                riskLevel: aiResponse.riskLevel
            });
        }

        res.status(201).json({
            log,
            analysis: aiResponse.data,
            riskLevel: aiResponse.riskLevel,
            message: aiResponse.success ? 'Analysis complete' : 'AI service unavailable',
            aiStatus: aiResponse.success ? 'Success' : 'Fallback (AI Unavailable)'
        });
    } catch (error) {
        console.error('Error in diagnoseSymptoms:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get health advice from AI (for patients)
// @route   POST /api/ai/health-advice
// @access  Private (All users)
const getHealthAdvice = async (req, res) => {
    try {
        const { question, symptoms, topic } = req.body;
        console.log('=== Health Advice Request ===');
        console.log('Question:', question);
        console.log('Symptoms:', symptoms);
        console.log('Topic:', topic);
        
        let prompt = '';
        if (question) {
            prompt = question;
        } else if (symptoms) {
            prompt = `I am experiencing: ${symptoms}. What should I do?`;
        } else if (topic) {
            prompt = `Give me health advice about: ${topic}`;
        }
        
        if (!prompt) {
            return res.status(400).json({ message: 'Please provide a question, symptoms, or topic' });
        }

        console.log('Final Prompt:', prompt);

        // Use the AI helper
        const aiResponse = await getDiagnosticSuggestions([prompt]);
        console.log('=== AI Response ===');
        console.log('Success:', aiResponse.success);
        console.log('Risk Level:', aiResponse.riskLevel);
        console.log('Data:', aiResponse.data);
        
        res.json({
            advice: aiResponse.success ? aiResponse.data : 'Please consult a healthcare professional for personalized advice.',
            riskLevel: aiResponse.riskLevel || 'low',
            disclaimer: 'This is AI-generated advice. Please consult a doctor for professional medical guidance.',
            aiStatus: aiResponse.success ? 'AI Response' : 'Fallback Response'
        });
    } catch (error) {
        console.error('Error in getHealthAdvice:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze uploaded file/report with AI
// @route   POST /api/ai/analyze-report
// @access  Private (Doctor, Patient)
const analyzeReport = async (req, res) => {
    try {
        const { reportText, reportType } = req.body;
        console.log('=== Analyze Report Request ===');
        console.log('Report Type:', reportType);
        console.log('Report Text Length:', reportText?.length);
        
        if (!reportText) {
            return res.status(400).json({ message: 'Report text is required' });
        }

        const prompt = `Analyze this ${reportType || 'medical'} report and provide insights:\n${reportText.substring(0, 2000)}`;
        console.log('Prompt:', prompt.substring(0, 200) + '...');
        
        const aiResponse = await getDiagnosticSuggestions([prompt]);
        console.log('=== AI Response ===');
        console.log('Success:', aiResponse.success);
        console.log('Risk Level:', aiResponse.riskLevel);
        console.log('Data:', aiResponse.data?.substring(0, 500));
        
        res.json({
            analysis: aiResponse.success ? aiResponse.data : 'Unable to analyze report at this time.',
            riskLevel: aiResponse.riskLevel || 'unknown',
            aiStatus: aiResponse.success ? 'AI Analysis' : 'Fallback Response'
        });
    } catch (error) {
        console.error('Error in analyzeReport:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get diagnosis logs
// @route   GET /api/ai/logs
// @access  Private
const getDiagnosisLogs = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Doctor') {
            query.doctorId = req.user._id;
        }

        const logs = await DiagnosisLog.find(query).lean()
            .populate('patientId', 'name contact')
            .populate('doctorId', 'name email')
            .sort({ createdAt: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    diagnoseSymptoms,
    getDiagnosisLogs,
    getHealthAdvice,
    analyzeReport
};
