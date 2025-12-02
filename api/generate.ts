// /api/generate.ts (The secure serverless function)

import { GoogleGenAI } from '@google/genai';

// CRITICAL: Access the secure, server-only key
const apiKey = process.env.GEMINI_SECRET_KEY; // NOTE: It must use this new name!

if (!apiKey) {
    console.error('SERVER ERROR: GEMINI_SECRET_KEY IS UNDEFINED');
    // Return a generic error to the client
    return res.status(500).json({ message: 'Server configuration error: API Key missing.' });
}

const ai = new GoogleGenAI({ apiKey });

export default async function handler(req, res) {
    // ... (rest of the secure code logic for handling POST, prompt, and calling ai.models.generateContent)
    // Make sure your logic correctly sends back res.status(200).json({ generatedText: response.text });
}