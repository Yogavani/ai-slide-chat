import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN || "";
const cloudflareTextModel =
  process.env.CLOUDFLARE_TEXT_MODEL || "@cf/meta/llama-3.1-8b-instruct";

function extractUserRequest(contents) {
  const text = String(contents ?? "");
  const match = text.match(/User request:\s*([\s\S]*)$/i);
  return (match?.[1] || text).trim();
}

function buildLocalFallbackSlidesFromRequest(userRequest) {
  const topic = userRequest.split("\n")[0].trim() || "Topic Overview";
  const shortTopic = topic.length > 90 ? `${topic.slice(0, 87)}...` : topic;

  return [
    {
      slide_content: {
        title: `Introduction: ${shortTopic}`,
        bullet_points: [
          "This slide deck was generated using offline fallback mode.",
          "The requested topic is summarized in a concise structure.",
          "You can edit each slide and regenerate when provider limits reset.",
        ],
        image_description: "A clean title visual representing the requested topic.",
      },
    },
    {
      slide_content: {
        title: "Key Points",
        bullet_points: [
          "Core concept 1 based on the prompt.",
          "Core concept 2 with practical explanation.",
          "Core concept 3 with examples and context.",
        ],
        image_description: "An illustrative diagram matching the key points.",
      },
    },
    {
      slide_content: {
        title: "Summary and Next Steps",
        bullet_points: [
          "Recap of the most important ideas.",
          "Suggested next step for deeper exploration.",
          "Use AI Edit to refine tone, depth, or audience level.",
        ],
        image_description: "A simple summary visual with a forward-looking theme.",
      },
    },
  ];
}

function buildLocalFallbackText(contents) {
  const userRequest = extractUserRequest(contents);
  const slides = buildLocalFallbackSlidesFromRequest(userRequest);
  return JSON.stringify({ slides });
}

function cleanModelJson(text) {
  return String(text ?? "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseSlidesFromText(text) {
  const cleaned = cleanModelJson(text);
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.slides)) return parsed.slides;
  } catch {
    // Return null and let client fallback parser handle it.
  }
  return null;
}

function buildSlidesPrompt(userPrompt) {
  return `Create presentation slides from the following user request.
Return ONLY valid JSON. No markdown fences. No prose.

Schema:
{
  "slides": [
    {
      "slide_content": {
        "title": "string",
        "bullet_points": ["string", "string"],
        "image_description": "string"
      }
    }
  ]
}

Rules:
- Create 3 to 6 slides unless user asked for a specific count.
- Keep bullet points concise and presentation-friendly.
- Include image_description for every slide.
- Do NOT include image_url in this step.

User request:
${userPrompt}`;
}

function buildEditSlidePrompt(slide, instruction) {
  return `You are editing exactly ONE presentation slide.
Return ONLY valid JSON (no markdown fences, no extra text).
Output format must be:
{
  "slides": [
    {
      "slide_content": {
        "title": "string",
        "bullet_points": ["string", "string"],
        "image_description": "string (optional)",
        "image_url": "https://... (optional)",
        "image_urls": ["https://..."]
      },
      "title": "string (optional for top-level schema)",
      "bullet_points": ["string"] (optional for top-level schema),
      "image_description": "string (optional for top-level schema)",
      "image_url": "https://... (optional for top-level schema)",
      "image_urls": ["https://..."]
    }
  ]
}

Important:
- Keep existing fields from input slide when possible.
- Do not remove bullet points unless explicitly requested.

Apply this edit instruction:
${instruction}

Current slide JSON:
${JSON.stringify(slide, null, 2)}`;
}

function getErrorCode(error) {
  return Number(error?.status || error?.code || 500);
}

function isGeminiQuotaError(error) {
  const status = getErrorCode(error);
  const message = String(error?.message || error?.error?.message || "");
  return status === 429 || /quota|resource_exhausted|rate limit/i.test(message);
}

async function generateWithCloudflareText(contents) {
  if (!cloudflareAccountId || !cloudflareApiToken) {
    throw new Error(
      "Gemini quota exhausted and Cloudflare fallback is not configured. Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN."
    );
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${encodeURIComponent(
    cloudflareTextModel
  )}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cloudflareApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: contents,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudflare fallback failed (${res.status}): ${errorText.slice(0, 500)}`);
  }

  const data = await res.json().catch(() => null);
  const text =
    data?.result?.response ||
    data?.result?.text ||
    data?.result?.output_text ||
    data?.response ||
    data?.text ||
    "";

  if (!text) {
    throw new Error("Cloudflare fallback returned no text.");
  }

  return String(text);
}

async function generateContentWithFallback(contents) {
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });
    return { text: response.text, contentModel: "gemini-2.5-flash", warnings: [] };
  } catch (error) {
    if (!isGeminiQuotaError(error)) throw error;

    try {
      const fallbackText = await generateWithCloudflareText(contents);
      return {
        text: fallbackText,
        contentModel: `cloudflare:${cloudflareTextModel}`,
        warnings: [
          "Gemini quota exhausted. Automatically used Cloudflare fallback model for content generation.",
        ],
      };
    } catch (cloudflareError) {
      console.error("Cloudflare text fallback failed:", cloudflareError);
      return {
        text: buildLocalFallbackText(contents),
        contentModel: "local:fallback",
        warnings: [
          "Gemini quota exhausted and Cloudflare fallback failed. Returned local fallback slides so the app keeps working.",
        ],
      };
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, action, slide, instruction } = body ?? {};

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    if (action === "generateSlideImage") {
      return NextResponse.json(
        {
          error: "Image generation moved to /api/generate-image. Use that endpoint.",
        },
        { status: 400 }
      );
    }

    if (action === "editSlide") {
      if (!slide || !instruction?.trim()) {
        return NextResponse.json(
          { error: "Missing slide or instruction for editSlide" },
          { status: 400 }
        );
      }

      const generated = await generateContentWithFallback(
        buildEditSlidePrompt(slide, instruction.trim())
      );

      return NextResponse.json({
        text: generated.text,
        contentModel: generated.contentModel,
        ...(generated.warnings?.length ? { warnings: generated.warnings } : {}),
      });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const generated = await generateContentWithFallback(buildSlidesPrompt(prompt));
    const parsedSlides = parseSlidesFromText(generated.text);

    if (!parsedSlides) {
      return NextResponse.json({
        text: generated.text,
        contentModel: generated.contentModel,
        warning:
          "Gemini did not return strict JSON slides; fallback parsing will be used on the client.",
        ...(generated.warnings?.length ? { warnings: generated.warnings } : {}),
      });
    }

    const warnings = [
      "Slides are generated without images by default. Use Generate Slide Image action to add images.",
      ...(generated.warnings || []),
    ];

    const slidesWithoutImages = parsedSlides.map((singleSlide) => {
      if (singleSlide?.slide_content && typeof singleSlide.slide_content === "object") {
        const nextSlideContent = { ...singleSlide.slide_content };
        delete nextSlideContent.image_url;
        delete nextSlideContent.image_urls;
        return { ...singleSlide, slide_content: nextSlideContent };
      }
      const nextSlide = { ...(singleSlide || {}) };
      delete nextSlide.image_url;
      delete nextSlide.image_urls;
      return nextSlide;
    });

    return NextResponse.json({
      slides: slidesWithoutImages,
      text: JSON.stringify({ slides: slidesWithoutImages }),
      contentModel: generated.contentModel,
      imageModel: null,
      warnings,
    });
  } catch (error) {
    console.error("Gemini Error Response:", error);
    const message = error?.message || error?.error?.message || "Gemini API request failed";
    const code = Number(error?.status || error?.code || 500);
    const status = Number.isFinite(code) && code >= 400 && code < 600 ? code : 500;

    return NextResponse.json(
      {
        error: "Gemini API request failed",
        ...(process.env.NODE_ENV !== "production" ? { details: message, code } : {}),
      },
      { status }
    );
  }
}
