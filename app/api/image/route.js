import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
      return NextResponse.json({ error: "Missing image url" }, { status: 400 });
    }

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return NextResponse.json({ error: "Invalid image url" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
    }

    const baseHeaders = {
      "User-Agent": "Mozilla/5.0 (compatible; AI-Slide-Chat/1.0)",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    };

    let upstream = await fetch(parsed.toString(), {
      headers: baseHeaders,
      cache: "no-store",
    });

    // Retry once with browser-like origin/referrer hints for hotlink-protected hosts.
    if (upstream.status === 403) {
      upstream = await fetch(parsed.toString(), {
        headers: {
          ...baseHeaders,
          Referer: `${parsed.origin}/`,
          Origin: parsed.origin,
        },
        cache: "no-store",
      });
    }

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream image fetch failed (${upstream.status})` },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Image proxy failed" }, { status: 500 });
  }
}
