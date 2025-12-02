/*
  NOVA – AI Resume Builder
  --------------------------------
  Service for Google Gemini API interactions.
  
  NOTE: The GoogleGenAI import and API key initialization were removed for security.
*/

// REMOVED: import { GoogleGenAI } from "@google/genai";
// REMOVED: const ai = new GoogleGenAI(...)

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Executes AI generation by securely calling the Vercel serverless API route.
 * @param prompt The text prompt (using PROMPTS object) to send for AI generation.
 * @returns An object containing the generated text or an error message.
 */
export const generateContent = async (prompt: string): Promise<GeminiResponse> => {
  try {
    // 1. Make a secure request to the Vercel Serverless Function
    // This calls the code in your api/generate.ts file, which is where the key is securely used.
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the prompt data in the body for the server to use
      body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 2. Handle errors returned by the serverless function (4xx or 5xx)
      console.error('Serverless function failed:', data);

      let message = data.details || data.message || 'AI generation service failed to respond.';
      
      // User friendly mapping for common issues now handled by the serverless function
      if (message.includes('API Key')) message = 'AI service configuration error. Please check Vercel environment variables.';
      if (message.includes('quota')) message = 'API Quota Exceeded. Try again later.';
      
      return { text: '', error: message };
    }

    // 3. Parse the successful response from the serverless function
    const generatedText = data.generatedText;

    if (!generatedText) {
      return { text: '', error: 'AI returned no content. Try a different prompt.' };
    }

    return { text: generatedText };

  } catch (error: any) {
    console.error('Network Fetch Error:', error);
    // This catch block handles pure client-side network issues (e.g., disconnected internet)
    return { text: '', error: 'Network connection failed while attempting to reach the AI service.' };
  }
};

// Prompts optimized for ATS and professional tone - KEEP THIS SECTION
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