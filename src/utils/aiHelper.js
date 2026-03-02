const Groq = require('groq-sdk');

let groq = null;

const getGroqClient = () => {
    if (!groq) {
        groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }
    return groq;
};

const getDiagnosticSuggestions = async (symptoms, isGeneralQuery = false) => {
    try {
        console.log('=== AI Helper Called (Groq) ===');
        console.log('Input symptoms/query:', symptoms);
        console.log('API Key exists:', !!process.env.GROQ_API_KEY);
        console.log('API Key prefix:', process.env.GROQ_API_KEY?.substring(0, 15) + '...');
        
        const client = getGroqClient();
        
        let prompt;
        if (isGeneralQuery || (symptoms.length === 1 && symptoms[0].length > 50)) {
            // This is a general health question, not symptoms
            prompt = `You are a helpful medical AI assistant. Answer the following health-related question clearly and helpfully:

Question: ${symptoms.join(' ')}

Provide a clear, informative response. Include:
- Direct answer to the question
- Relevant health advice
- When to see a doctor (if applicable)
- Risk Level: (Low, Moderate, or High) based on the concern

Keep the response concise but helpful. Always state the Risk Level clearly.`;
        } else {
            // This is a symptoms-based diagnosis query
            prompt = `You are a medical AI assistant helping a doctor. The patient presents with the following symptoms: ${symptoms.join(', ')}. 
        Provide a short list of possible conditions, a suggested risk level (Low, Moderate, High), and recommended preliminary tests. 
        Format the response in plain text but cleanly structured. Risk Level should be clearly stated.`;
        }

        console.log('Sending prompt to Groq...');

        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful medical AI assistant. Provide accurate, helpful health information while always recommending professional medical consultation for serious concerns."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '';
        console.log('Groq Response received, length:', responseText.length);
        console.log('Response preview:', responseText.substring(0, 200));

        // Extract risk level heuristically
        let riskLevel = 'Low';
        if (responseText.match(/Risk Level:\s*High/i) || responseText.match(/high risk/i)) riskLevel = 'High';
        else if (responseText.match(/Risk Level:\s*Moderate/i) || responseText.match(/moderate risk/i)) riskLevel = 'Moderate';
        else if (responseText.match(/Risk Level:\s*Low/i) || responseText.match(/low risk/i)) riskLevel = 'Low';

        console.log('Extracted Risk Level:', riskLevel);

        return {
            success: true,
            data: responseText,
            riskLevel
        };
    } catch (error) {
        console.error('=== AI Helper Error ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        // Graceful fallback if AI fails or times out
        return {
            success: false,
            data: "AI Service is currently unavailable. Please proceed with manual diagnosis.",
            riskLevel: 'Unknown'
        };
    }
};

module.exports = { getDiagnosticSuggestions };
