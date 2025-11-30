
/*
  NOVA – AI Resume Builder
  --------------------------------
  Service for Google Gemini API interactions.
*/

import { GoogleGenAI } from "@google/genai";

// === API CONFIGURATION ===
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({
apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export interface GeminiResponse {
  text: string;
  error?: string;
}

export const generateContent = async (prompt: string): Promise<GeminiResponse> => {
  try {
    // Guidelines: Use gemini-2.5-flash for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const generatedText = response.text;
    
    if (!generatedText) {
      return { text: '', error: 'AI returned no content. Try a different prompt.' };
    }

    return { text: generatedText };

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    let message = error.message || 'Network connection failed.';
    // User friendly mapping
    if (message.includes('API key')) return { text: '', error: 'Invalid API Key. Please check the environment configuration.' };
    if (message.includes('quota')) return { text: '', error: 'API Quota Exceeded. Try again later.' };

    return { text: '', error: message };
  }
};

// Prompts optimized for ATS and professional tone
export const PROMPTS = {
  summary: (role: string, skills: string, experienceLevel: string) => `
    Act as a professional resume writer. Write a high-impact, professional resume summary (max 3 sentences) for a ${experienceLevel} ${role}.
    Key skills to highlight: ${skills}. 
    Tone: Professional, results-oriented, ATS-friendly. 
    Focus on value provided. Do NOT use markdown bold/headers. Just plain text.
  `,
  
  experience: (role: string, company: string, tasks: string) => `
    Act as a professional resume writer. Rewrite these raw notes into 3-4 professional, bullet-pointed achievements for a ${role} at ${company}.
    Raw Notes: "${tasks}"
    Rules:
    - Use strong action verbs (Led, Developed, Optimized).
    - Quantify results where possible (e.g. increased by 20%).
    - Format as a plain list with "• " prefix for each bullet. 
    - No introduction or markdown code blocks.
  `,

  project: (title: string, technologies: string, description: string) => `
    Act as a professional resume writer. Rewrite this project description to be technically impressive for a resume.
    Project: ${title}
    Tech Stack: ${technologies}
    Raw Description: "${description}"
    Rules:
    - Write 2-3 concise sentences.
    - Highlight the problem solved and technical implementation.
    - No markdown formatting.
  `,

  parseResume: (text: string) => `
    You are a Resume Parser AI. Extract data from the raw text below and return ONLY a valid JSON object matching this specific structure. 
    Do not add markdown formatting or explanations. If a field is not found, leave it empty string or empty array.

    Structure:
    {
      "personalInfo": {
        "fullName": "Name",
        "email": "Email",
        "phone": "Phone",
        "linkedin": "LinkedIn URL",
        "portfolio": "Portfolio URL",
        "role": "Current Job Title",
        "location": "City, Country"
      },
      "summary": "Professional Summary text",
      "skills": {
        "technical": ["Skill1", "Skill2"], 
        "web": ["Skill1", "Skill2"],
        "tools": ["Tool1", "Tool2"],
        "soft": ["Skill1", "Skill2"]
      },
      "experience": [
        { "company": "", "role": "", "startDate": "MM/YYYY", "endDate": "MM/YYYY", "description": "Full description text", "current": boolean }
      ],
      "education": [
        { "institution": "", "degree": "", "year": "YYYY", "score": "" }
      ],
      "projects": [
        { "title": "", "description": "", "technologies": "", "link": "" }
      ],
      "certificates": [
        { "title": "", "issuer": "", "date": "", "link": "" }
      ],
      "languages": ["English", "Spanish"]
    }

    Resume Text:
    "${text.substring(0, 15000).replace(/"/g, "'")}"
  `
};
