import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// Model is overridable via env since Gemini's model lineup moves faster than this file does.
export async function generateOneLiner(prompt: string): Promise<string> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await ai.models.generateContent({ model, contents: prompt });
  return (response.text ?? "").trim();
}
