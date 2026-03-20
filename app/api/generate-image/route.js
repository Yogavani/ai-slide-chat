import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const imageMode = (process.env.IMAGE_MODE || "auto").toLowerCase();
const usePaidImageModel = imageMode !== "free" && Boolean(openai);
const freeImageProvider = (process.env.FREE_IMAGE_PROVIDER || "pollinations").toLowerCase();
const cloudflareAccountId = (process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();
const cloudflareApiToken = (process.env.CLOUDFLARE_API_TOKEN || "").trim();
const cloudflareImageModel =
  (
    process.env.CLOUDFLARE_IMAGE_MODEL ||
    "@cf/bytedance/stable-diffusion-xl-lightning"
  ).trim();
const providerTimeoutMs = Number(process.env.IMAGE_PROVIDER_TIMEOUT_MS || 9000);

function getTitle(slide) {
  return slide?.slide_content?.title ?? slide?.title ?? "Untitled Slide";
}

function getBullets(slide) {
  const bullets =
    slide?.slide_content?.bullet_points ?? slide?.bullet_points ?? slide?.content ?? [];
  if (Array.isArray(bullets)) return bullets.map((b) => String(b));
  if (typeof bullets === "string") return [bullets];
  return [];
}

function getImageDescription(slide) {
  return slide?.slide_content?.image_description ?? slide?.image_description ?? "";
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function getSlideTopicText(slide) {
  return [getTitle(slide), getImageDescription(slide), getBullets(slide).join(" ")]
    .filter(Boolean)
    .join(" ");
}

function pickRelevantInstruction(slide, overrideInstruction = "") {
  const instruction = String(overrideInstruction || "").trim();
  if (!instruction) return "";

  const instructionTokens = new Set(tokenize(instruction));
  const slideTokens = new Set(tokenize(getSlideTopicText(slide)));

  let overlap = 0;
  for (const token of instructionTokens) {
    if (slideTokens.has(token)) overlap += 1;
  }

  return overlap > 0 ? instruction : "";
}

function buildFreeImagePrompt(slide, overrideInstruction = "") {
  const relevantInstruction = pickRelevantInstruction(slide, overrideInstruction);
  const title = getTitle(slide);
  const bullets = getBullets(slide).slice(0, 2).join("; ");
  const imageDescription = getImageDescription(slide);

  const prompt = [
    relevantInstruction,
    `Topic: ${title}`,
    `Visual: ${imageDescription}`,
    bullets ? `Context: ${bullets}` : "",
    "Educational medical/science illustration style as appropriate.",
    "No text, no watermark, no collage.",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return prompt.slice(0, 260);
}

function buildPollinationsImageUrl(prompt) {
  const cleaned = String(prompt || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return null;

  const encoded = encodeURIComponent(cleaned);
  let hash = 0;
  for (let i = 0; i < cleaned.length; i += 1) {
    hash = (hash * 31 + cleaned.charCodeAt(i)) >>> 0;
  }
  const seed = hash % 1000000;

  return `https://image.pollinations.ai/prompt/${encoded}?width=1536&height=1024&seed=${seed}&model=flux&nologo=true&private=true&safe=true`;
}

function withProxyCandidates(payload) {
  const primary = payload?.image_url;
  const urls = Array.isArray(payload?.image_urls) ? payload.image_urls : [];
  const merged = [primary, ...urls].filter(Boolean);
  const unique = [...new Set(merged)];

  const withProxy = [...unique];
  for (const u of unique) {
    if (/^https?:\/\//i.test(u)) {
      const proxied = `/api/image?url=${encodeURIComponent(u)}`;
      if (!withProxy.includes(proxied)) withProxy.push(proxied);
    }
  }

  return {
    ...payload,
    image_url: unique[0] || "",
    image_urls: withProxy,
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = providerTimeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error(`Provider timed out after ${timeoutMs}ms`);
      timeoutError.code = "provider_timeout";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function generateFreeImageUrl(slide, overrideInstruction = "") {
  const prompt = buildFreeImagePrompt(slide, overrideInstruction);

  if (freeImageProvider === "cloudflare") {
    if (!cloudflareAccountId || !cloudflareApiToken) {
      return {
        error:
          "Cloudflare image provider needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.",
      };
    }

    if (!/^[a-f0-9]{32}$/i.test(cloudflareAccountId)) {
      return {
        error: "Invalid CLOUDFLARE_ACCOUNT_ID format (expected 32 hex chars).",
        status: 500,
      };
    }

    const endpoints = [
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${encodeURIComponent(
        cloudflareImageModel
      )}`,
      `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${cloudflareImageModel}`,
    ];

    let res = null;
    let lastErrorText = "";
    for (const endpoint of endpoints) {
      let response;
      try {
        response = await fetchWithTimeout(
          endpoint,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cloudflareApiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
            }),
            cache: "no-store",
          },
          providerTimeoutMs
        );
      } catch (providerError) {
        return {
          error: "Cloudflare image generation timed out.",
          status: 504,
          details: providerError?.message || "Provider timeout",
          canFallback: true,
        };
      }
      if (response.ok) {
        res = response;
        break;
      }
      lastErrorText = await response.text();
      const hasNoRoute = /"code"\s*:\s*7000|No route for that URI/i.test(lastErrorText);
      if (!hasNoRoute) {
        res = response;
        break;
      }
    }

    if (!res || !res.ok) {
      const status = res?.status || 502;
      const errorText = lastErrorText || (res ? await res.text() : "");
      return {
        error: `Cloudflare image generation failed (${status})`,
        status,
        details: errorText.slice(0, 500),
        canFallback: true,
      };
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      const arr = await res.arrayBuffer();
      const b64 = Buffer.from(arr).toString("base64");
      const dataUrl = `data:${contentType};base64,${b64}`;
      return {
        image_url: dataUrl,
        image_urls: [dataUrl],
        source: `cloudflare:${cloudflareImageModel}`,
        prompt_used: prompt,
      };
    }

    const data = await res.json().catch(() => null);
    const b64Candidate =
      data?.result?.image ||
      data?.result?.b64_json ||
      data?.image ||
      data?.b64_json ||
      data?.data?.[0]?.b64_json ||
      data?.output?.[0]?.b64_json ||
      "";
    if (b64Candidate) {
      const dataUrl = `data:image/png;base64,${b64Candidate}`;
      return {
        image_url: dataUrl,
        image_urls: [dataUrl],
        source: `cloudflare:${cloudflareImageModel}`,
        prompt_used: prompt,
      };
    }

    const urlCandidate =
      data?.result?.url || data?.result?.image_url || data?.image_url || data?.url || "";
    if (urlCandidate) {
      return {
        image_url: urlCandidate,
        image_urls: [urlCandidate],
        source: `cloudflare:${cloudflareImageModel}`,
        prompt_used: prompt,
      };
    }

    return {
      error: "Cloudflare response did not contain an image payload.",
      details: JSON.stringify(data).slice(0, 500),
    };
  }

  if (freeImageProvider === "pollinations") {
    const pollinationsUrl = buildPollinationsImageUrl(prompt);
    if (pollinationsUrl) {
      return {
        image_url: pollinationsUrl,
        image_urls: [pollinationsUrl],
        source: "pollinations:flux",
        prompt_used: prompt,
      };
    }
  }

  return null;
}

async function generatePaidImage(slide) {
  if (!openai) return null;

  const image = await Promise.race([
    openai.images.generate({
      model: "gpt-image-1",
      prompt: `Create a clean presentation illustration. Title: ${getTitle(slide)}. Bullets: ${getBullets(slide)
        .slice(0, 6)
        .join("; ")}. Visual direction: ${getImageDescription(slide)}. No text overlays. 16:9 composition.`,
      size: "1536x1024",
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`OpenAI image timed out after ${providerTimeoutMs}ms`)), providerTimeoutMs)
    ),
  ]);

  const b64 = image?.data?.[0]?.b64_json;
  if (b64) {
    return {
      image_url: `data:image/png;base64,${b64}`,
      image_urls: [`data:image/png;base64,${b64}`],
      source: "openai:gpt-image-1",
    };
  }

  const url = image?.data?.[0]?.url;
  if (url) {
    return {
      image_url: url,
      image_urls: [url],
      source: "openai:gpt-image-1",
    };
  }

  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { slide, instruction } = body ?? {};

    if (!slide) {
      return NextResponse.json({ error: "Missing slide for generateSlideImage" }, { status: 400 });
    }

    const queryPrompt = typeof instruction === "string" ? instruction.trim() : "";

    if (usePaidImageModel) {
      try {
        const paidImage = await generatePaidImage(slide);
        if (paidImage?.image_url) {
          return NextResponse.json(withProxyCandidates(paidImage));
        }
      } catch (imageError) {
        const code = imageError?.code || imageError?.type || "unknown_error";
        if (code === "billing_hard_limit_reached") {
          // Fall through to free mode.
        } else {
          console.error("Paid image generation failed:", imageError);
        }
      }
    }

    const freeImage = await generateFreeImageUrl(slide, queryPrompt);
    if (freeImage?.image_url) {
      const warnings = [];
      if (imageMode === "free") {
        warnings.push("IMAGE_MODE=free is active. Using free image model only.");
      } else if (usePaidImageModel) {
        warnings.push("Paid image model unavailable. Fell back to free image model.");
      }

      return NextResponse.json({
        ...withProxyCandidates(freeImage),
        ...(warnings.length ? { warnings } : {}),
      });
    }

    if (freeImage?.error && freeImage?.canFallback) {
      const pollinationsUrl = buildPollinationsImageUrl(buildFreeImagePrompt(slide, queryPrompt));
      if (pollinationsUrl) {
        return NextResponse.json({
          ...withProxyCandidates({
            image_url: pollinationsUrl,
            image_urls: [pollinationsUrl],
            source: "pollinations:flux",
          }),
          warnings: [
            "Cloudflare image generation failed. Automatically fell back to Pollinations.",
          ],
          cloudflare_error: freeImage.error,
          ...(freeImage.details ? { cloudflare_details: freeImage.details } : {}),
        });
      }
    }

    if (freeImage?.error) {
      return NextResponse.json(
        {
          error: freeImage.error,
          ...(freeImage.details ? { details: freeImage.details } : {}),
        },
        { status: freeImage.status || 502 }
      );
    }

    return NextResponse.json(
      { error: "No relevant image found for this slide. Try a simpler prompt." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Generate image API failed:", error);
    const message = error?.message || "Image generation failed";

    return NextResponse.json(
      {
        error: "Image generation failed",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {}),
      },
      { status: 500 }
    );
  }
}
