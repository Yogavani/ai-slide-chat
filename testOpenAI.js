import { GoogleGenerativeAI } from "@google/generative-ai";

const client = new GoogleGenerativeAI({
  apiKey: "AIzaSyBPiXhGZEk0IqyGsey1ztAWU-NrDIn8iws", // your valid key
});

async function testGemini() {
  try {
    const response = await client.models.generateText({
      model: "text-bison-001",  // latest public model
      prompt: "Write a short joke about React developers",
      temperature: 0.7,
      maxOutputTokens: 200,
    });

    console.log("Gemini Response:", response.candidates[0].content);
  } catch (err) {
    console.error("Gemini Test Error:", err);
  }
}

testGemini();
