// import { GoogleGenAI } from "@google/genai";

// const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export async function POST(req) {
//   try {
//     const { prompt } = await req.json();

//     const response = await client.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//     });

//     return new Response(
//       JSON.stringify({ slides: response.text }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );

//   } catch (err) {
//     console.error("Gemini API Error:", err);
//     return new Response(
//       JSON.stringify({ error: "AI generation failed", details: err.message }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }




// /app/api/gemini/route.js  (for Next.js 13+)
// OR /pages/api/gemini.js  (for older Next.js)

// app/api/generate/route.js
// app/api/generate/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Error Response:", error);
    return NextResponse.json({ error: "Gemini API request failed" }, { status: 500 });
  }
}




