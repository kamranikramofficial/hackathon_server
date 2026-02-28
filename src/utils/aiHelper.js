const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

const getDiagnosticSuggestions = async (symptoms) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are a medical AI assistant helping a doctor. The patient presents with the following symptoms: ${symptoms.join(', ')}. 
        Provide a short list of possible conditions, a suggested risk level (Low, Moderate, High), and recommended preliminary tests. 
        Format the response in plain text but cleanly structured. Risk Level should be clearly stated.`;

        // Add a timeout to handle AI failures gracefully
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI Request Timeout')), 8000)
        );

        const result = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise
        ]);

        const responseText = result.response.text();

        // Extract risk level heuristically (just an approximation)
        let riskLevel = 'Unknown';
        if (responseText.match(/Risk Level:\s*High/i)) riskLevel = 'High';
        else if (responseText.match(/Risk Level:\s*Moderate/i)) riskLevel = 'Moderate';
        else if (responseText.match(/Risk Level:\s*Low/i)) riskLevel = 'Low';

        return {
            success: true,
            data: responseText,
            riskLevel
        };
    } catch (error) {
        console.error('AI Helper Error:', error.message);
        // Graceful fallback if AI fails or times out
        return {
            success: false,
            data: "AI Service is currently unavailable. Please proceed with manual diagnosis.",
            riskLevel: 'Unknown'
        };
    }
};

module.exports = { getDiagnosticSuggestions };
