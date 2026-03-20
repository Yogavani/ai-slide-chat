import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY. Add it to .env.local or your shell.");
}

const client = new GoogleGenAI({ apiKey });

async function testGemini() {
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Write a short joke about React developers",
    });

    console.log("Gemini Response:", response.text);
  } catch (err) {
    console.error("Gemini Test Error:", err);
  }
}

testGemini();
