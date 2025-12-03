import { GoogleGenerativeAI } from "@google/generative-ai";

;

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const apiKey = process.env.GEMINI_SECRET_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_SECRET_KEY" }),
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ text }), { status: 200 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

