import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const apiKey = process.env.GEMINI_SECRET_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_SECRET_KEY" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Extract text (new SDK format)
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return res.status(500).json({ error: "Empty response from Gemini" });
    }

    return res.status(200).json({ text });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
