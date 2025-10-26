import { GoogleGenAI } from "@google/genai"; 

// Replace with your actual key or use process.env.GEMINI_API_KEY
const apiKey = "AIzaSyBPiXhGZEk0IqyGsey1ztAWU-NrDIn8iws"; // Replace with your valid API key

const client = new GoogleGenAI({ apiKey }); 

async function testGemini() {
  try {
    // 💡 FINAL FIX: Access the method via the 'models' property
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: "Create 3 slides about React Hooks", 
    });

    // Access the generated text
    console.log("Gemini Response:", response.text);
    
  } catch (error) {
    console.error("Gemini Test Error:", error);
  }
}

testGemini();