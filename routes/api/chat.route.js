const express = require('express');
const router = express.Router();
const { CohereClient } = require('cohere-ai');

// Initialize Cohere
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

// System prompt to restrict to Compassionate Capitalism & Black Wall Street
const SYSTEM_PROMPT = `You are an AI assistant for Compassionate Capitalism and Black Wall Street. 
You can ONLY answer questions related to:
- Compassionate Capitalism (ethical capitalism combining profit with social good)
- Black Wall Street (historical Greenwood District, Tulsa 1921, economic empowerment)
- Financial literacy for Black communities
- Entrepreneurship and business development
- Economic justice and wealth building
- Community investment and cooperative economics
- Black business history and success stories

If a user asks about anything outside these topics, politely respond:
"I can only provide information about Compassionate Capitalism and Black Wall Street. Please ask me about economic empowerment, ethical business practices, or Black business history."`;

router.post('/send', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        // Build chat history
        const chatHistory = [
            { role: 'SYSTEM', message: SYSTEM_PROMPT },
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'USER' : 'CHATBOT',
                message: msg.content
            })),
            { role: 'USER', message: message }
        ];

        // Call Cohere API
        const response = await cohere.chat({
            message: message,
            chatHistory: chatHistory.slice(0, -1), // Exclude current message
            model: process.env.COHERE_MODEL || 'command-r-plus',
            temperature: 0.7,
            maxTokens: 500,
            preamble: SYSTEM_PROMPT
        });

        res.json({
            success: true,
            reply: response.text,
            usage: response.meta?.tokens
        });

    } catch (error) {
        console.error('Cohere API Error:', error);
        res.status(500).json({
            success: false,
            message: 'AI service temporarily unavailable',
            reply: "I'm having trouble connecting right now. Please try again in a moment."
        });
    }
});

router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'Cohere AI - Compassionate Capitalism',
        restrictedTo: ['Compassionate Capitalism', 'Black Wall Street']
    });
});

module.exports = router;