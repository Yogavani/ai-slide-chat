# DeckGenie

AI-powered PPT generator built with Next.js. Generate slide content, edit slides, add AI images per slide, preview with templates, run slideshow mode, and download as editable or non-editable PPT.

## Features

- AI slide content generation (`gemini-2.5-flash`) with fallback flow
- AI slide edit mode (`Apply AI Edit`)
- Per-slide image generation via separate API (`/api/generate-image`)
- Cloudflare / OpenAI / Pollinations provider strategy (configurable)
- Slide design templates in preview
- Slideshow mode
- PPT export:
  - Non-editable (exact visual capture)
  - Editable (native text/image objects)
- Session persistence (refresh-safe, tab-close resets)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- `@google/genai` (Gemini)
- `openai` SDK
- `pptxgenjs`
- `html-to-image`

## Project Structure

```txt
app/
  api/
    generate/route.js         # content generation + fallback
    generate-image/route.js   # image generation providers
    image/route.js            # image proxy/redirect helper
  globals.css
  layout.tsx
  page.tsx
components/
  ChatWindow.jsx
  PPTPreview.jsx
lib/
  pptGenerator.js
```

## Environment Variables

Create `.env.local`:

```env
# Content model
GEMINI_API_KEY=

# Optional content fallback (used when Gemini quota hits)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_TEXT_MODEL=@cf/meta/llama-3.1-8b-instruct

# Image generation strategy
IMAGE_MODE=auto
# auto | free

# If IMAGE_MODE=free, choose provider:
FREE_IMAGE_PROVIDER=cloudflare
# cloudflare | pollinations

# Cloudflare image model (free mode)
CLOUDFLARE_IMAGE_MODEL=@cf/bytedance/stable-diffusion-xl-lightning

# Optional paid image model path
OPENAI_API_KEY=

# Provider timeout in ms
IMAGE_PROVIDER_TIMEOUT_MS=9000
```

Notes:
- Keep `CLOUDFLARE_API_TOKEN` secret.
- In Netlify, set env vars for the correct context (Production / Deploy Preview), then redeploy.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

### `POST /api/generate`
Generates slides or edits one slide.

Request (new deck):

```json
{ "prompt": "Create 5 slides about JavaScript closures" }
```

Request (edit one slide):

```json
{
  "action": "editSlide",
  "slide": { "slide_content": { "title": "...", "bullet_points": ["..."] } },
  "instruction": "make this simpler for beginners"
}
```

### `POST /api/generate-image`
Generates image for one slide (separate from content generation).

```json
{
  "slide": {
    "slide_content": {
      "title": "Human Kidney",
      "bullet_points": ["..."],
      "image_description": "Anatomical diagram"
    }
  },
  "instruction": "clean educational medical illustration"
}
```

### `GET /api/image?url=...`
Proxy/redirect helper for external images.

## Deployment (Netlify)

1. Add all required env vars in **Site configuration → Environment variables**.
2. Ensure `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` are set if using Cloudflare images.
3. Trigger a fresh deploy after env updates.

If you see Cloudflare auth errors (`401`, code `10000`), token/account config is incorrect in Netlify (even if local works).

## Common Issues

- `Missing GEMINI_API_KEY`: add `GEMINI_API_KEY`.
- `Cloudflare image provider needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN`: missing env vars in deployed environment.
- `Cloudflare ... 401 Authentication error`: invalid token or insufficient permissions.
- Pollinations image load failures with very long prompts: retry with shorter instruction.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

Built for quick AI-to-deck workflow with editable and exact-preview export options.
