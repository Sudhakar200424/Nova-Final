// api/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.GEMINI_SECRET_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing on server." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const { prompt } = req.body;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }]}]
    });

    return res.status(200).json({ text: result.response.text() });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
