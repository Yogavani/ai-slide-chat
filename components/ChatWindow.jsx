"use client";

import React, { useEffect, useRef, useState } from "react";
import Markdown from "markdown-to-jsx";
import { toPng } from "html-to-image";

const SLIDE_TEMPLATES = [
  {
    title: "Startup Pitch",
    prompt:
      "Create 10 slides for a startup pitch deck: problem, solution, market size, business model, traction, competition, go-to-market, financials, team, and ask.",
  },
  {
    title: "Product Launch",
    prompt:
      "Create 8 slides for a product launch presentation: product overview, customer pain points, key features, demo flow, pricing, launch plan, success metrics, and CTA.",
  },
  {
    title: "Marketing Plan",
    prompt:
      "Create 8 slides for a digital marketing plan for the next 90 days with channels, budget split, campaign ideas, KPIs, and timeline.",
  },
  {
    title: "Sales Deck",
    prompt:
      "Create 7 slides for a B2B sales presentation with customer challenges, solution fit, ROI proof, case study, implementation steps, and closing slide.",
  },
  {
    title: "Business Proposal",
    prompt:
      "Create 9 slides for a business proposal to a new client with scope, deliverables, project phases, timeline, team, pricing, and next steps.",
  },
  {
    title: "Project Update",
    prompt:
      "Create 6 slides for a weekly project status update: objectives, completed work, blockers, risks, KPIs, and next-week plan.",
  },
  {
    title: "Research Summary",
    prompt:
      "Create 8 slides summarizing a research topic: background, methodology, findings, charts to include, implications, limitations, and conclusion.",
  },
  {
    title: "Case Study",
    prompt:
      "Create 7 slides for a case study presentation with client context, challenge, approach, implementation, outcomes, and lessons learned.",
  },
  {
    title: "Roadmap",
    prompt:
      "Create 8 slides for a 12-month product roadmap with quarterly goals, feature themes, dependencies, risks, and expected impact.",
  },
  {
    title: "Training Deck",
    prompt:
      "Create 10 slides for beginner training on JavaScript closures with concept explanation, examples, common mistakes, and practice tasks.",
  },
  {
    title: "Lesson Plan",
    prompt:
      "Create 8 educational slides on parts of the human heart with simple definitions, blood flow explanation, and one recap quiz slide.",
  },
  {
    title: "Exam Revision",
    prompt:
      "Create 9 revision slides on photosynthesis for high school students with key terms, process steps, diagram idea, and memory tricks.",
  },
  {
    title: "HR Onboarding",
    prompt:
      "Create 7 slides for employee onboarding: company culture, policies, tools, communication norms, first-week checklist, and support contacts.",
  },
  {
    title: "Portfolio Deck",
    prompt:
      "Create 8 slides for a designer portfolio presentation with profile, selected projects, process, results, testimonials, and contact slide.",
  },
  {
    title: "Event Proposal",
    prompt:
      "Create 8 slides proposing a college tech event with theme, audience, agenda, speakers, budget, sponsors, logistics, and expected outcomes.",
  },
];

const SLIDE_DESIGN_TEMPLATES = [
  { id: "aurora", name: "Aurora", layout: "hero-center", bgClass: "from-fuchsia-700 via-violet-700 to-indigo-700", titleClass: "text-white", bodyClass: "text-fuchsia-50", panelClass: "bg-black/20 border border-white/25" },
  { id: "midnight-glass", name: "Midnight Glass", layout: "split-left", bgClass: "from-slate-900 via-slate-800 to-blue-900", titleClass: "text-white", bodyClass: "text-slate-200", panelClass: "bg-white/10 border border-white/20 backdrop-blur-sm" },
  { id: "sunset", name: "Sunset", layout: "title-band", bgClass: "from-orange-600 via-rose-600 to-purple-700", titleClass: "text-white", bodyClass: "text-rose-50", panelClass: "bg-black/20 border border-orange-200/35" },
  { id: "ocean", name: "Ocean", layout: "split-right", bgClass: "from-cyan-700 via-blue-700 to-indigo-800", titleClass: "text-cyan-50", bodyClass: "text-blue-100", panelClass: "bg-blue-950/35 border border-cyan-200/30" },
  { id: "emerald-slate", name: "Emerald Slate", layout: "cards", bgClass: "from-emerald-700 via-teal-700 to-slate-800", titleClass: "text-emerald-50", bodyClass: "text-emerald-100", panelClass: "bg-black/20 border border-emerald-200/30" },
  { id: "rose-noir", name: "Rose Noir", layout: "hero-center", bgClass: "from-rose-800 via-slate-900 to-zinc-900", titleClass: "text-rose-100", bodyClass: "text-rose-50", panelClass: "bg-black/25 border border-rose-200/25" },
  { id: "mono-pro", name: "Mono Pro", layout: "minimal-left", bgClass: "from-zinc-800 via-zinc-900 to-black", titleClass: "text-zinc-100", bodyClass: "text-zinc-300", panelClass: "bg-zinc-900/55 border border-zinc-500/40" },
  { id: "royal-blue", name: "Royal Blue", layout: "title-band", bgClass: "from-blue-800 via-blue-700 to-violet-700", titleClass: "text-white", bodyClass: "text-blue-50", panelClass: "bg-blue-950/35 border border-blue-200/35" },
  { id: "cyber-teal", name: "Cyber Teal", layout: "split-left", bgClass: "from-teal-700 via-cyan-800 to-slate-900", titleClass: "text-teal-100", bodyClass: "text-cyan-100", panelClass: "bg-black/25 border border-teal-200/30" },
  { id: "plum-fog", name: "Plum Fog", layout: "cards", bgClass: "from-purple-900 via-fuchsia-900 to-slate-800", titleClass: "text-fuchsia-100", bodyClass: "text-purple-100", panelClass: "bg-white/10 border border-fuchsia-200/25" },
  { id: "copper-night", name: "Copper Night", layout: "split-right", bgClass: "from-amber-700 via-orange-800 to-zinc-900", titleClass: "text-amber-50", bodyClass: "text-orange-100", panelClass: "bg-black/30 border border-amber-200/25" },
  { id: "deep-space", name: "Deep Space", layout: "minimal-left", bgClass: "from-indigo-950 via-slate-900 to-black", titleClass: "text-indigo-100", bodyClass: "text-slate-200", panelClass: "bg-indigo-950/35 border border-indigo-200/25" },
  { id: "ruby-wave", name: "Ruby Wave", layout: "hero-center", bgClass: "from-rose-700 via-red-700 to-pink-800", titleClass: "text-rose-50", bodyClass: "text-pink-100", panelClass: "bg-black/20 border border-rose-100/30" },
  { id: "forest-night", name: "Forest Night", layout: "split-left", bgClass: "from-green-700 via-emerald-800 to-slate-900", titleClass: "text-green-50", bodyClass: "text-emerald-100", panelClass: "bg-black/20 border border-green-100/30" },
  { id: "skyline", name: "Skyline", layout: "title-band", bgClass: "from-sky-700 via-indigo-700 to-purple-800", titleClass: "text-sky-50", bodyClass: "text-indigo-100", panelClass: "bg-black/20 border border-sky-100/30" },
  { id: "formal-white", name: "Formal White", layout: "title-band", backgroundClass: "bg-white", titleClass: "text-slate-900", bodyClass: "text-slate-700", panelClass: "bg-white border border-slate-200 shadow-xl", counterClass: "text-slate-700" },
  { id: "formal-paper", name: "Formal Paper", layout: "minimal-left", backgroundClass: "bg-slate-100", titleClass: "text-slate-900", bodyClass: "text-slate-700", panelClass: "bg-white border border-slate-300 shadow-xl", counterClass: "text-slate-700" },
  { id: "boardroom", name: "Boardroom", layout: "split-left", backgroundClass: "bg-slate-200", titleClass: "text-slate-900", bodyClass: "text-slate-700", panelClass: "bg-white border border-slate-300 shadow-xl", counterClass: "text-slate-700" },
  { id: "clean-sky", name: "Clean Sky", layout: "split-right", backgroundClass: "bg-sky-50", titleClass: "text-sky-900", bodyClass: "text-sky-800", panelClass: "bg-white border border-sky-200 shadow-xl", counterClass: "text-sky-900" },
  { id: "clean-mint", name: "Clean Mint", layout: "cards", backgroundClass: "bg-emerald-50", titleClass: "text-emerald-900", bodyClass: "text-emerald-800", panelClass: "bg-white border border-emerald-200 shadow-xl", counterClass: "text-emerald-900" },
  { id: "ivory-pro", name: "Ivory Pro", layout: "hero-center", backgroundClass: "bg-amber-50", titleClass: "text-amber-900", bodyClass: "text-amber-800", panelClass: "bg-white border border-amber-200 shadow-xl", counterClass: "text-amber-900" },
  { id: "ink-light", name: "Ink Light", layout: "minimal-left", backgroundClass: "bg-zinc-100", titleClass: "text-zinc-900", bodyClass: "text-zinc-700", panelClass: "bg-white border border-zinc-300 shadow-xl", counterClass: "text-zinc-800" },
  { id: "office-blue", name: "Office Blue", layout: "title-band", backgroundClass: "bg-blue-100", titleClass: "text-blue-900", bodyClass: "text-blue-800", panelClass: "bg-white border border-blue-200 shadow-xl", counterClass: "text-blue-900" },
  { id: "office-gray", name: "Office Gray", layout: "split-left", backgroundClass: "bg-slate-300", titleClass: "text-slate-900", bodyClass: "text-slate-800", panelClass: "bg-white border border-slate-400 shadow-xl", counterClass: "text-slate-900" },
  { id: "classic-white", name: "Classic White", layout: "hero-center", backgroundClass: "bg-white", titleClass: "text-neutral-900", bodyClass: "text-neutral-700", panelClass: "bg-white border border-neutral-300 shadow-xl", counterClass: "text-neutral-800" },
];

const DEMO_SLIDES = [
  {
    slide_content: {
      title: "Applied AI in Education",
      bullet_points: [
        "Personalized learning paths adapt to student pace.",
        "AI tutors provide instant feedback and practice.",
        "Teachers use analytics to identify learning gaps.",
      ],
      image_description: "Students interacting with AI-powered learning tools in a modern classroom.",
    },
  },
  {
    slide_content: {
      title: "Benefits for Students",
      bullet_points: [
        "Improved engagement through interactive content.",
        "Targeted revision based on weak concepts.",
        "Anytime learning support beyond classroom hours.",
      ],
      image_description: "Student dashboard showing progress, strengths, and recommendations.",
    },
  },
  {
    slide_content: {
      title: "Implementation Roadmap",
      bullet_points: [
        "Start with one subject and pilot classroom.",
        "Train teachers on AI-assisted lesson workflows.",
        "Track outcomes with monthly performance metrics.",
      ],
      image_description: "Roadmap timeline with milestones for AI rollout in schools.",
    },
  },
];

function parseAISlides(aiResponseText) {
  try {
    const cleaned = aiResponseText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) return parsed;
    if (parsed?.slides && Array.isArray(parsed.slides)) return parsed.slides;

    console.error("Parsed JSON is not an array or slides:", parsed);
    return buildFallbackSlides(aiResponseText);
  } catch (err) {
    console.warn("AI response was not valid JSON; building fallback slides", err);
    return buildFallbackSlides(aiResponseText);
  }
}

function buildFallbackSlides(text) {
  const cleaned = String(text ?? "").trim();
  if (!cleaned) return [];

  // Split by markdown slide headings (## Slide ...), then by horizontal rules.
  const byHeading = cleaned
    .split(/\n(?=##\s+)/g)
    .map((section) => section.trim())
    .filter(Boolean);

  const sections =
    byHeading.length > 1
      ? byHeading
      : cleaned
          .split(/\n-{3,}\n/g)
          .map((section) => section.trim())
          .filter(Boolean);

  if (sections.length === 0) {
    return [{ title: "AI Response", content: [cleaned] }];
  }

  return sections.map((section, idx) => {
    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const titleLine =
      lines.find((line) => /^#{1,6}\s+/.test(line)) ||
      lines.find((line) => /\*\*Title:\*\*/i.test(line)) ||
      lines[0] ||
      `Slide ${idx + 1}`;

    const title = titleLine
      .replace(/^#{1,6}\s+/, "")
      .replace(/^\*\*Title:\*\*\s*/i, "")
      .replace(/^\*+|\*+$/g, "")
      .trim();

    const bulletPoints = lines
      .filter((line) => line !== titleLine)
      .map((line) =>
        line
          .replace(/^[-*]\s+/, "")
          .replace(/^\d+\.\s+/, "")
          .trim()
      )
      .filter(Boolean);

    const imageUrls = extractImageUrlsFromSection(section);
    const imageUrl = imageUrls[0] || "";
    const imageDescriptionLine = lines.find((line) =>
      /image|caption/i.test(line)
    );

    return {
      title: title || `Slide ${idx + 1}`,
      bullet_points:
        bulletPoints.length > 0
          ? bulletPoints
          : [section.slice(0, 300)],
      ...(imageUrl ? { image_url: imageUrl } : {}),
      ...(imageUrls.length > 0 ? { image_urls: imageUrls } : {}),
      ...(imageDescriptionLine ? { image_description: imageDescriptionLine } : {}),
    };
  });
}

function sanitizeUrl(raw) {
  if (!raw) return "";
  let url = String(raw).trim();

  // Remove markdown wrappers/punctuation that often leak from rich text.
  url = url.replace(/^[[("'<]+/, "").replace(/[\])>"'.,;:]+$/, "");

  return url;
}

function isLikelyImageUrl(raw) {
  const url = sanitizeUrl(raw);
  if (/^data:image\//i.test(url)) return true;
  if (/^\/api\/image\?url=/i.test(url)) return true;
  if (!/^https?:\/\//i.test(url)) return false;
  if (/^https?:\/\/image\.pollinations\.ai\/prompt\//i.test(url)) return true;
  if (/^https?:\/\/images\.weserv\.nl\//i.test(url)) return true;
  return /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(url);
}

function extractImageUrlsFromSection(section) {
  const candidates = [];

  const markdownLinkRegex = /\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/gi;
  for (const match of section.matchAll(markdownLinkRegex)) {
    candidates.push(match[1]);
  }

  const bracketedUrlRegex = /\[(https?:\/\/[^\]\s]+)\]/gi;
  for (const match of section.matchAll(bracketedUrlRegex)) {
    candidates.push(match[1]);
  }

  const plainUrlRegex = /https?:\/\/[^\s)\]]+/gi;
  for (const match of section.matchAll(plainUrlRegex)) {
    candidates.push(match[0]);
  }

  const validUnique = [];
  for (const candidate of candidates) {
    const url = sanitizeUrl(candidate);
    if (isLikelyImageUrl(url) && !validUnique.includes(url)) {
      validUnique.push(url);
    }
  }

  return validUnique;
}

function getSlideTitle(slide) {
  return slide?.slide_content?.title ?? slide?.title ?? "Untitled Slide";
}

function getSlideBulletPoints(slide) {
  const bullets =
    slide?.slide_content?.bullet_points ??
    slide?.bullet_points ??
    slide?.content ??
    [];

  if (Array.isArray(bullets)) {
    return bullets.map((item) =>
      typeof item === "string" ? item : item?.text || JSON.stringify(item)
    );
  }

  if (typeof bullets === "string") {
    return bullets
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function createEditableSlide(slide) {
  const bulletPoints = getSlideBulletPoints(slide);

  return {
    title: getSlideTitle(slide),
    bulletPoints: bulletPoints.length > 0 ? bulletPoints : [""],
  };
}

function getSlideImageDescription(slide) {
  return slide?.slide_content?.image_description ?? slide?.image_description ?? "";
}

function getSlideImageUrl(slide) {
  return slide?.slide_content?.image_url ?? slide?.image_url ?? "";
}

function getSlideImageCandidates(slide) {
  const candidates = [];

  const contentUrls = slide?.slide_content?.image_urls;
  if (Array.isArray(contentUrls)) candidates.push(...contentUrls);

  const topLevelUrls = slide?.image_urls;
  if (Array.isArray(topLevelUrls)) candidates.push(...topLevelUrls);

  const primary = getSlideImageUrl(slide);
  if (primary) candidates.unshift(primary);

  const validUnique = [];
  for (const candidate of candidates) {
    const url = sanitizeUrl(candidate);
    if (isLikelyImageUrl(url) && !validUnique.includes(url)) {
      validUnique.push(url);
    }
  }

  const resolved = [];
  for (const url of validUnique) {
    if (/^\/api\/image\?url=/i.test(url)) {
      if (!resolved.includes(url)) resolved.push(url);
      continue;
    }

    if (/^data:image\//i.test(url)) {
      if (!resolved.includes(url)) resolved.push(url);
      continue;
    }

    // Pollinations URLs should stay direct to avoid proxy 502s on serverless hosts.
    if (/^https?:\/\/image\.pollinations\.ai\/prompt\//i.test(url)) {
      if (!resolved.includes(url)) resolved.push(url);
      continue;
    }

    const proxied = `/api/image?url=${encodeURIComponent(url)}`;
    if (!resolved.includes(proxied)) resolved.push(proxied);
    if (!resolved.includes(url)) resolved.push(url);
    const noProtocol = url.replace(/^https?:\/\//i, "");
    const publicProxy = `https://images.weserv.nl/?url=${encodeURIComponent(noProtocol)}`;
    if (!resolved.includes(publicProxy)) resolved.push(publicProxy);
  }

  return resolved;
}

function updateSlideContent(slide, title, bullets) {
  if (slide?.slide_content && typeof slide.slide_content === "object") {
    return {
      ...slide,
      slide_content: {
        ...slide.slide_content,
        title,
        bullet_points: bullets,
      },
    };
  }

  if (Array.isArray(slide?.bullet_points) || "bullet_points" in (slide ?? {})) {
    return {
      ...slide,
      title,
      bullet_points: bullets,
    };
  }

  return {
    ...slide,
    title,
    content: bullets,
  };
}

function updateSlideImage(slide, imageUrl, imageUrls = []) {
  const merged = [imageUrl, ...imageUrls].filter(Boolean);
  const unique = [...new Set(merged)];
  const primary = unique[0] || "";

  if (slide?.slide_content && typeof slide.slide_content === "object") {
    return {
      ...slide,
      slide_content: {
        ...slide.slide_content,
        image_url: primary,
        image_urls: unique,
      },
    };
  }

  return {
    ...slide,
    image_url: primary,
    image_urls: unique,
  };
}

function cloneSlide(slide) {
  return JSON.parse(JSON.stringify(slide));
}

function createChatMessage(type, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    text,
    createdAt: new Date().toISOString(),
  };
}

function formatChatTime(createdAt) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getEditableThemeByDesign(designId) {
  const byId = {
    "rose-noir": {
      bg: "2a0f1a",
      title: "ffe4e6",
      body: "fff1f2",
      accent: "fda4af",
    },
    "ivory-pro": {
      bg: "fffbeb",
      title: "78350f",
      body: "92400e",
      accent: "fde68a",
    },
    "formal-white": {
      bg: "ffffff",
      title: "111827",
      body: "334155",
      accent: "cbd5e1",
    },
    "classic-white": {
      bg: "ffffff",
      title: "171717",
      body: "3f3f46",
      accent: "d4d4d8",
    },
  };

  return (
    byId[designId] || {
      bg: "1f2937",
      title: "ffffff",
      body: "e2e8f0",
      accent: "c4b5fd",
    }
  );
}

const APP_STATE_KEY = "deckgenie_app_state_v1";

export default function ChatWindow() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPPT, setShowPPT] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  const [imageInstruction, setImageInstruction] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [imageCandidateIndex, setImageCandidateIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [isDemoPreviewMode, setIsDemoPreviewMode] = useState(false);
  const [slideDesignId, setSlideDesignId] = useState("aurora");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("preview");
  const [previewImageHeight, setPreviewImageHeight] = useState(208);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showEditableDownloadWarning, setShowEditableDownloadWarning] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [hasHydratedState, setHasHydratedState] = useState(false);
  const [editableSlide, setEditableSlide] = useState({
    title: "",
    bulletPoints: [""],
  });

  const chatEndRef = useRef(null);
  const promptInputRef = useRef(null);
  const slidePreviewRef = useRef(null);
  const exportSlideRef = useRef(null);
  const slideshowActiveRef = useRef(false);
  const slideshowLengthRef = useRef(0);

  const applyTemplate = (templatePrompt) => {
    setPrompt(templatePrompt);
    setShowWelcome(false);
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 0);
  };

  const loadDemoSlides = () => {
    setShowWelcome(false);
    setSlides(DEMO_SLIDES);
    setShowPPT(true);
    setIsDemoPreviewMode(true);
    setCurrentSlide(0);
    setIsEditingSlide(false);
    setUndoStack([]);
    setImageInstruction("");
    setAiEditInstruction("");
    setImageCandidateIndex(0);
    setImageFailed(false);
    setEditableSlide(createEditableSlide(DEMO_SLIDES[0]));
    setRightPanelTab("preview");
    setMessages((prev) => [
      ...prev,
      createChatMessage("ai", "Loaded demo slides for template preview testing."),
    ]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    if (showWelcome) setShowWelcome(false);

    const userMessage = createChatMessage("user", prompt);
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    setSlides([]);
    setIsDemoPreviewMode(false);
    setCurrentSlide(0);
    setIsEditingSlide(false);
    setUndoStack([]);
    setImageInstruction("");

    const isPPT = /ppt|slide|presentation/i.test(userMessage.text);
    setShowPPT(isPPT);

    try {
      const thinkingMessage = createChatMessage("ai", "Thinking...");
      setMessages((prev) => [...prev, thinkingMessage]);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.text }),
      });

      const data = await res.json();
      setMessages((prev) => prev.filter((msg) => msg.text !== "Thinking..."));

      if (!res.ok) {
        const quotaMessage =
          res.status === 429
            ? "Content generation is temporarily busy. Please try again shortly."
            : "Unable to generate slides right now. Please try again.";

        setMessages((prev) => [
          ...prev,
          createChatMessage("ai", quotaMessage),
        ]);
        return;
      }

      if (data?.slides || data?.text) {
        const parsedSlides = Array.isArray(data?.slides)
          ? data.slides
          : parseAISlides(data.text);
        setSlides(parsedSlides);
        setShowPPT(parsedSlides.length > 0 || isPPT);
        setRightPanelTab("preview");

        if (parsedSlides.length > 0) {
          setEditableSlide(createEditableSlide(parsedSlides[0]));
        }

        if (!isPPT) {
          if (parsedSlides.length > 0) {
            const textContent = parsedSlides
              .map((slide) => {
                const title = getSlideTitle(slide);
                const bullets = getSlideBulletPoints(slide);
                return `${title}\n${bullets.join("\n")}`.trim();
              })
              .join("\n\n");
            setMessages((prev) => [...prev, createChatMessage("ai", textContent)]);
          } else {
            setMessages((prev) => [
              ...prev,
              createChatMessage("ai", data.text || "No response from AI."),
            ]);
          }
        }

        // Intentionally suppress raw backend warnings in chat to avoid leaking provider/internal details.
      }
    } catch (error) {
      console.error("Error generating slides:", error);
      setMessages((prev) =>
        prev
          .filter((msg) => msg.text !== "Thinking...")
          .concat(
            createChatMessage("ai", "Unable to generate slides right now. Please try again.")
          )
      );
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setIsEditingSlide(false);
      setImageCandidateIndex(0);
      setImageFailed(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setIsEditingSlide(false);
      setImageCandidateIndex(0);
      setImageFailed(false);
    }
  };

  const startEditingCurrentSlide = () => {
    if (!current) return;
    setEditableSlide(createEditableSlide(current));
    setIsEditingSlide(true);
  };

  const handleStartEditFromSettings = () => {
    setRightPanelTab("preview");
    startEditingCurrentSlide();
  };

  const startSlideshow = () => {
    if (!slides.length) return;
    setRightPanelTab("preview");
    setShowSlideshow(true);
  };

  const stopSlideshow = () => {
    setShowSlideshow(false);
  };

  const cancelEditingCurrentSlide = () => {
    setIsEditingSlide(false);
    if (current) {
      setEditableSlide(createEditableSlide(current));
    }
  };

  const updateBullet = (index, value) => {
    setEditableSlide((prev) => {
      const nextBullets = [...prev.bulletPoints];
      nextBullets[index] = value;
      return { ...prev, bulletPoints: nextBullets };
    });
  };

  const addBullet = () => {
    setEditableSlide((prev) => ({
      ...prev,
      bulletPoints: [...prev.bulletPoints, ""],
    }));
  };

  const removeBullet = (index) => {
    setEditableSlide((prev) => {
      const nextBullets = prev.bulletPoints.filter((_, i) => i !== index);
      return {
        ...prev,
        bulletPoints: nextBullets.length > 0 ? nextBullets : [""],
      };
    });
  };

  const saveCurrentSlideEdits = () => {
    const cleanedTitle = editableSlide.title.trim() || "Untitled Slide";
    const cleanedBullets = editableSlide.bulletPoints
      .map((bp) => bp.trim())
      .filter(Boolean);
    const previousSlide = slides[currentSlide];

    if (previousSlide) {
      setUndoStack((prev) => [
        ...prev,
        { slideIndex: currentSlide, previousSlide: cloneSlide(previousSlide) },
      ]);
    }

    setSlides((prevSlides) =>
      prevSlides.map((slide, idx) =>
        idx === currentSlide
          ? updateSlideContent(slide, cleanedTitle, cleanedBullets)
          : slide
      )
    );

    setIsEditingSlide(false);
  };

  const handleApplyAIEdit = async () => {
    if (!current || !aiEditInstruction.trim() || aiEditLoading) return;

      const sourceSlide =
        isEditingSlide && editableSlide
          ? updateSlideContent(
              current ?? {},
              editableSlide.title.trim() || "Untitled Slide",
              editableSlide.bulletPoints.map((bp) => bp.trim()).filter(Boolean)
            )
          : current;

    setAiEditLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "editSlide",
          slide: sourceSlide,
          instruction: aiEditInstruction.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "AI edit failed");
      }

      const parsedSlides = parseAISlides(data?.text || "");
      if (parsedSlides.length === 0) {
        throw new Error("Model did not return editable slide JSON");
      }

      const editedSlide = parsedSlides[0];
      setUndoStack((prev) => [
        ...prev,
        { slideIndex: currentSlide, previousSlide: cloneSlide(sourceSlide) },
      ]);
      setSlides((prevSlides) =>
        prevSlides.map((slide, idx) => (idx === currentSlide ? editedSlide : slide))
      );
      setEditableSlide(createEditableSlide(editedSlide));
      setIsEditingSlide(false);
      setImageCandidateIndex(0);
      setAiEditInstruction("");
      setMessages((prev) => [
        ...prev,
        createChatMessage("ai", `Applied AI edit: ${aiEditInstruction.trim()}`),
      ]);
    } catch (error) {
      console.error("AI slide edit failed:", error);
      setMessages((prev) => [
        ...prev,
        createChatMessage("ai", "AI edit failed. Please try rephrasing the instruction."),
      ]);
    } finally {
      setAiEditLoading(false);
    }
  };

  const handleUndoLastEdit = () => {
    const lastEdit = undoStack[undoStack.length - 1];
    if (!lastEdit) return;

    setUndoStack((prev) => prev.slice(0, -1));
    setSlides((prevSlides) =>
      prevSlides.map((slide, idx) =>
        idx === lastEdit.slideIndex ? lastEdit.previousSlide : slide
      )
    );
    setCurrentSlide(lastEdit.slideIndex);
    setIsEditingSlide(false);
    setImageCandidateIndex(0);
    setEditableSlide(createEditableSlide(lastEdit.previousSlide));
    setMessages((prev) => [...prev, createChatMessage("ai", "Undid last slide edit.")]);
  };

  const handleGenerateSlideImage = async () => {
    if (!current || imageLoading) return;

    const sourceSlide =
      isEditingSlide && editableSlide
        ? updateSlideContent(
            current ?? {},
            editableSlide.title.trim() || "Untitled Slide",
            editableSlide.bulletPoints.map((bp) => bp.trim()).filter(Boolean)
          )
        : current;

    setImageLoading(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slide: sourceSlide,
          instruction: imageInstruction.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.image_url) {
        throw new Error(
          data?.details ? `${data?.error || "Image generation failed"}: ${data.details}` : data?.error || "Image generation failed"
        );
      }

      setUndoStack((prev) => [
        ...prev,
        { slideIndex: currentSlide, previousSlide: cloneSlide(current) },
      ]);
      setSlides((prevSlides) =>
        prevSlides.map((slide, idx) =>
          idx === currentSlide
            ? updateSlideImage(
                slide,
                data.image_url,
                Array.isArray(data.image_urls) ? data.image_urls : []
              )
            : slide
        )
      );
      setImageCandidateIndex(0);
      setImageFailed(false);
      setImageInstruction("");
      setMessages((prev) => [
        ...prev,
        createChatMessage("ai", "Image added to the slide."),
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createChatMessage("ai", "Unable to add image right now. Please try again."),
      ]);
    } finally {
      setImageLoading(false);
    }
  };

  const toPptImageData = (dataUri) => {
    if (!dataUri || typeof dataUri !== "string") return "";
    // PptxGenJS expects "image/png;base64,...." (without the "data:" prefix).
    if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(dataUri)) {
      return dataUri.replace(/^data:/i, "");
    }
    if (/^image\/[a-zA-Z0-9.+-]+;base64,/i.test(dataUri)) {
      return dataUri;
    }
    return "";
  };

  const waitForImagesInNode = async (node, timeoutMs = 4000) => {
    if (!node) return;
    const images = Array.from(node.querySelectorAll("img"));
    if (images.length === 0) return;

    await Promise.race([
      Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve(true);
              const done = () => resolve(true);
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
        )
      ),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  };

  const handleDownloadPpt = async (mode = "exact") => {
    if (!slides || slides.length === 0 || downloadLoading) return;
    setDownloadLoading(true);
    const debugId = `ppt-${Date.now()}`;
    console.group(`[PPT][${debugId}] Download start`);
    console.log("[PPT] mode:", mode);
    console.log("[PPT] slide count:", slides.length);
    console.log("[PPT] selected design:", slideDesignId);
    try {
      const PptxGenJSModule = await import("pptxgenjs");
      const PptxGenJS = PptxGenJSModule.default || PptxGenJSModule;
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
      pptx.author = "AI Slide Chat";
      pptx.subject = "Generated presentation";
      pptx.title = "AI Generated Slides";
      pptx.company = "AI Slide Chat";
      const originalSlideIndex = currentSlide;
      const originalEditingState = isEditingSlide;
      const originalImageIndex = imageCandidateIndex;
      const originalRightPanelTab = rightPanelTab;
      setIsEditingSlide(false);
      setImageCandidateIndex(0);
      setRightPanelTab("preview");
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));
      await new Promise((resolve) => setTimeout(resolve, 80));

      if (mode === "editable") {
        const theme = getEditableThemeByDesign(slideDesignId);
        for (let i = 0; i < slides.length; i += 1) {
          const item = slides[i];
          const slide = pptx.addSlide();
          slide.background = { color: theme.bg };

          const title = getSlideTitle(item);
          const bullets = getSlideBulletPoints(item).filter(Boolean);
          const imageUrl = getSlideImageUrl(item);

          slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.45,
            y: 0.4,
            w: 12.45,
            h: 6.65,
            rectRadius: 0.08,
            line: { color: theme.accent, pt: 1.2 },
            fill: { color: theme.bg, transparency: 20 },
          });

          slide.addText(title || "Untitled Slide", {
            x: 0.8,
            y: 0.65,
            w: 11.7,
            h: 0.8,
            fontFace: "Calibri",
            bold: true,
            underline: { color: theme.title, style: "sng" },
            color: theme.title,
            fontSize: 26,
            valign: "top",
          });

          if (bullets.length > 0) {
            const bulletRuns = bullets.slice(0, 10).map((point) => ({
              text: point,
              options: { bullet: { indent: 18 } },
            }));
            slide.addText(bulletRuns, {
              x: 0.95,
              y: 1.6,
              w: 6.2,
              h: 4.9,
              fontFace: "Calibri",
              color: theme.body,
              fontSize: 18,
              breakLine: true,
              valign: "top",
            });
          }

          if (imageUrl) {
            try {
              if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(imageUrl)) {
                slide.addImage({
                  data: imageUrl.replace(/^data:/i, ""),
                  x: 7.35,
                  y: 1.7,
                  w: 5.35,
                  h: 3.8,
                });
              } else if (/^https?:\/\//i.test(imageUrl)) {
                slide.addImage({
                  path: imageUrl,
                  x: 7.35,
                  y: 1.7,
                  w: 5.35,
                  h: 3.8,
                });
              }
            } catch (imageErr) {
              console.warn("[PPT] editable mode image add failed:", imageErr);
            }
          }
        }
      } else {
        for (let i = 0; i < slides.length; i += 1) {
        console.group(`[PPT][${debugId}] Slide ${i + 1}/${slides.length}`);
        setCurrentSlide(i);
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));
        await new Promise((resolve) => setTimeout(resolve, 90));

        const captureCandidates = [exportSlideRef.current].filter(Boolean);
        console.log(
          "[PPT] capture candidates:",
          captureCandidates.map((node) =>
            node === exportSlideRef.current ? "exportSlideRef" : "slidePreviewRef"
          )
        );
        if (captureCandidates.length === 0) {
          console.groupEnd();
          throw new Error("Slide preview not available for capture.");
        }

        let dataUrl = "";
        let lastCaptureError = null;
        for (const node of captureCandidates) {
          try {
            await waitForImagesInNode(node);
            const computed = window.getComputedStyle(node);
            console.log("[PPT] trying node:", {
              ref: node === exportSlideRef.current ? "exportSlideRef" : "slidePreviewRef",
              clientWidth: node.clientWidth,
              clientHeight: node.clientHeight,
              offsetWidth: node.offsetWidth,
              offsetHeight: node.offsetHeight,
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity,
            });
            dataUrl = await toPng(node, {
              cacheBust: true,
              pixelRatio: 3,
              backgroundColor: "#ffffff",
              skipFonts: false,
            });
            if (dataUrl) {
              console.log("[PPT] capture success:", {
                ref: node === exportSlideRef.current ? "exportSlideRef" : "slidePreviewRef",
                dataUrlPrefix: dataUrl.slice(0, 32),
                dataUrlLength: dataUrl.length,
              });
              break;
            }
          } catch (captureError) {
            console.error("[PPT] capture failed for node:", captureError);
            lastCaptureError = captureError;
          }
        }

        if (!dataUrl) {
          console.groupEnd();
          throw new Error(
            `Slide capture failed${lastCaptureError?.message ? `: ${lastCaptureError.message}` : ""}`
          );
        }
        const data = toPptImageData(dataUrl);
        console.log("[PPT] image data header:", data.split(",")[0] || "");
        console.log("[PPT] encoded length:", data.length);
        if (!data) {
          console.groupEnd();
          throw new Error("Captured image data is empty.");
        }
        const slide = pptx.addSlide();
        slide.addImage({
          data,
          x: 0,
          y: 0,
          w: 13.33,
          h: 7.5,
        });
        console.log("[PPT] slide image added.");
        console.groupEnd();
      }
      }

      setCurrentSlide(originalSlideIndex);
      setIsEditingSlide(originalEditingState);
      setImageCandidateIndex(originalImageIndex);
      setRightPanelTab(originalRightPanelTab);

      const fileName = `ai-slides-${new Date()
        .toISOString()
        .slice(0, 10)}.pptx`;
      await pptx.writeFile({ fileName });
      console.log("[PPT] writeFile success:", fileName);
      setMessages((prev) => [
        ...prev,
        createChatMessage(
          "ai",
          mode === "editable"
            ? `Downloaded editable PPT: ${fileName}`
            : `Downloaded exact-preview PPT: ${fileName}`
        ),
      ]);
    } catch (error) {
      console.error(`[PPT][${debugId}] download failed:`, error);
      setMessages((prev) => [
        ...prev,
        createChatMessage("ai", `PPT download failed: ${error?.message || "Unknown error"}`),
      ]);
    } finally {
      console.groupEnd();
      setDownloadLoading(false);
    }
  };

  const openDownloadModal = () => {
    setShowEditableDownloadWarning(false);
    setShowDownloadModal(true);
  };

  const handleNonEditableDownload = () => {
    setShowDownloadModal(false);
    handleDownloadPpt("exact");
  };

  const handleEditableDownloadClick = () => {
    setShowEditableDownloadWarning(true);
  };

  const confirmEditableDownload = () => {
    setShowDownloadModal(false);
    setShowEditableDownloadWarning(false);
    handleDownloadPpt("editable");
  };

  const handlePromptKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleBackToHome = () => {
    setShowWelcome(true);
    setShowPPT(false);
    setShowMobilePreview(false);
    setShowSlideshow(false);
    setRightPanelTab("preview");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevDocOverflow;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(APP_STATE_KEY);
      if (!raw) {
        setHasHydratedState(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        setHasHydratedState(true);
        return;
      }

      if (typeof parsed.prompt === "string") setPrompt(parsed.prompt);
      if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
      if (Array.isArray(parsed.slides)) setSlides(parsed.slides);
      if (typeof parsed.currentSlide === "number") setCurrentSlide(Math.max(0, parsed.currentSlide));
      if (typeof parsed.showPPT === "boolean") setShowPPT(parsed.showPPT);
      if (typeof parsed.showWelcome === "boolean") setShowWelcome(parsed.showWelcome);
      if (typeof parsed.isDemoPreviewMode === "boolean") setIsDemoPreviewMode(parsed.isDemoPreviewMode);
      if (typeof parsed.slideDesignId === "string") setSlideDesignId(parsed.slideDesignId);
      if (typeof parsed.rightPanelTab === "string") setRightPanelTab(parsed.rightPanelTab);
      if (typeof parsed.aiEditInstruction === "string") setAiEditInstruction(parsed.aiEditInstruction);
      if (typeof parsed.imageInstruction === "string") setImageInstruction(parsed.imageInstruction);
      if (Array.isArray(parsed.undoStack)) setUndoStack(parsed.undoStack);
      if (typeof parsed.isEditingSlide === "boolean") setIsEditingSlide(parsed.isEditingSlide);
      if (parsed.editableSlide && typeof parsed.editableSlide === "object") {
        setEditableSlide(parsed.editableSlide);
      }
      if (typeof parsed.previewImageHeight === "number") setPreviewImageHeight(parsed.previewImageHeight);
      if (typeof parsed.showTemplatePicker === "boolean") setShowTemplatePicker(parsed.showTemplatePicker);
    } catch {
      // Ignore corrupted state snapshots.
    } finally {
      setHasHydratedState(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem(APP_STATE_KEY);
      localStorage.removeItem("slide_design_template");
    } catch {
      // Ignore localStorage cleanup issues.
    }
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("slide_design_template");
      if (!saved) return;
      const exists = SLIDE_DESIGN_TEMPLATES.some((template) => template.id === saved);
      if (exists) setSlideDesignId(saved);
    } catch {
      // Ignore storage issues in restricted environments.
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("slide_design_template", slideDesignId);
    } catch {
      // Ignore storage issues in restricted environments.
    }
  }, [slideDesignId]);

  useEffect(() => {
    if (!hasHydratedState) return;
    const snapshot = {
      prompt,
      messages,
      slides,
      currentSlide,
      showPPT,
      showWelcome,
      isDemoPreviewMode,
      slideDesignId,
      rightPanelTab,
      aiEditInstruction,
      imageInstruction,
      undoStack,
      isEditingSlide,
      editableSlide,
      previewImageHeight,
      showTemplatePicker,
    };

    try {
      sessionStorage.setItem(APP_STATE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage write issues.
    }
  }, [
    hasHydratedState,
    prompt,
    messages,
    slides,
    currentSlide,
    showPPT,
    showWelcome,
    isDemoPreviewMode,
    slideDesignId,
    rightPanelTab,
    aiEditInstruction,
    imageInstruction,
    undoStack,
    isEditingSlide,
    editableSlide,
    previewImageHeight,
    showTemplatePicker,
  ]);

  const current = slides[currentSlide];
  const selectedDesign =
    SLIDE_DESIGN_TEMPLATES.find((template) => template.id === slideDesignId) ||
    SLIDE_DESIGN_TEMPLATES[0];
  const slideBackgroundClass =
    selectedDesign.backgroundClass || `bg-gradient-to-br ${selectedDesign.bgClass}`;
  const slideCounterClass = selectedDesign.counterClass || "text-white";
  const currentImageCandidates = current ? getSlideImageCandidates(current) : [];
  const currentImageUrl =
    currentImageCandidates.length > 0
      ? currentImageCandidates[Math.min(imageCandidateIndex, currentImageCandidates.length - 1)]
      : "";
  const currentImageRecommendation = current ? getSlideImageDescription(current) : "";
  const isChatMode = !showWelcome && messages.length > 0;

  useEffect(() => {
    if (!current) return;
    if (!isEditingSlide) {
      setEditableSlide(createEditableSlide(current));
    }
  }, [currentSlide, slides, current, isEditingSlide]);

  useEffect(() => {
    if (!slides.length) {
      if (currentSlide !== 0) setCurrentSlide(0);
      return;
    }
    if (currentSlide > slides.length - 1) {
      setCurrentSlide(slides.length - 1);
    }
  }, [slides.length, currentSlide]);

  useEffect(() => {
    setImageCandidateIndex(0);
    setImageFailed(false);
  }, [currentSlide, current?.title, current?.slide_content?.title, current?.image_url, current?.slide_content?.image_url]);

  useEffect(() => {
    slideshowActiveRef.current = showSlideshow;
    slideshowLengthRef.current = slides.length;
  }, [showSlideshow, slides.length]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!slideshowActiveRef.current) return;
      if (event.key === "Escape") {
        event.preventDefault();
        stopSlideshow();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, Math.max(0, slideshowLengthRef.current - 1)));
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const renderSlidePreviewContent = (forExport = false, forceReadOnly = false) => {
    if (!current) return null;

    if (isEditingSlide && !forceReadOnly) {
      return (
        <div className="relative w-full h-full p-6 overflow-auto space-y-4">
          <input
            value={editableSlide.title}
            onChange={(e) =>
              setEditableSlide((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Slide title"
            className="w-full rounded-md px-3 py-2 text-xl font-semibold bg-slate-900/90 text-white border border-white/20"
          />

          <div className="space-y-2">
            {editableSlide.bulletPoints.map((bp, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={bp}
                  onChange={(e) => updateBullet(idx, e.target.value)}
                  placeholder={`Bullet ${idx + 1}`}
                  className="flex-1 rounded-md px-3 py-2 bg-slate-900/90 text-white border border-white/20"
                />
                <button
                  onClick={() => removeBullet(idx)}
                  className="px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                  title="Delete bullet"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                    <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={addBullet}
              className="px-4 py-2 rounded-md bg-fuchsia-600 text-white hover:bg-fuchsia-500"
            >
              Add Bullet
            </button>
            <button
              onClick={saveCurrentSlideEdits}
              className="px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-500"
            >
              Save
            </button>
            <button
              onClick={cancelEditingCurrentSlide}
              className="px-4 py-2 rounded-md bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full overflow-hidden ${forExport ? "p-2" : "p-6"}`}>
        {(() => {
          const title = getSlideTitle(current);
          const bullets = getSlideBulletPoints(current);
          const textLoad = bullets.join(" ").length + title.length;
          const isSplitLayout =
            selectedDesign.layout === "split-left" || selectedDesign.layout === "split-right";
          const layoutBase = isSplitLayout ? 180 : 140;
          const densityPenalty = Math.min(100, Math.floor(textLoad / 24));
          const autoFittedImageHeight = Math.max(72, layoutBase - densityPenalty);
          const effectiveImageHeight = Math.min(previewImageHeight, autoFittedImageHeight);
          const titleClasses = `${forExport ? "text-5xl mb-4" : "text-3xl mb-4"} font-bold break-words underline decoration-2 underline-offset-4 ${selectedDesign.titleClass}`;
          const bodyClasses = `list-disc pl-6 ${forExport ? "space-y-3 text-[24px] leading-[1.4]" : "space-y-3 text-[18px] leading-relaxed"} break-words ${selectedDesign.bodyClass}`;
          const imageBlock =
            currentImageUrl && !imageFailed ? (
              <div
                className="bg-white/10 rounded-lg border border-white/30 overflow-hidden flex items-center justify-center"
                style={{ height: `${effectiveImageHeight}px` }}
              >
                <img
                  src={currentImageUrl}
                  alt={getSlideImageDescription(current) || "Slide image"}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageFailed(false)}
                  onError={() => {
                    if (imageCandidateIndex < currentImageCandidates.length - 1) {
                      setImageCandidateIndex((prev) => prev + 1);
                      return;
                    }
                    setImageFailed(true);
                  }}
                />
              </div>
            ) : null;

          const imageNote =
            currentImageUrl && imageFailed ? (
              <p className={`mt-3 text-sm ${selectedDesign.bodyClass}`}>
                Image could not be loaded. Try Generate Slide Image again with a shorter prompt.
              </p>
            ) : null;

          if (selectedDesign.layout === "split-left") {
            return (
              <div className={`rounded-2xl ${forExport ? "p-2" : "p-5"} shadow-xl h-full overflow-hidden ${selectedDesign.panelClass}`}>
                <div className="grid grid-cols-2 gap-4 h-full overflow-auto">
                  <div className="pr-1">
                    <h2 className={titleClasses}>{title}</h2>
                    <ul className={bodyClasses}>
                      {bullets.map((bp, idx) => <li key={idx}>{bp}</li>)}
                    </ul>
                  </div>
                  <div className="flex flex-col">
                    {imageBlock}
                    {imageNote}
                  </div>
                </div>
              </div>
            );
          }

          if (selectedDesign.layout === "split-right") {
            return (
              <div className={`rounded-2xl ${forExport ? "p-2" : "p-5"} shadow-xl h-full overflow-hidden ${selectedDesign.panelClass}`}>
                <div className="grid grid-cols-2 gap-4 h-full overflow-auto">
                  <div className="flex flex-col">
                    {imageBlock}
                    {imageNote}
                  </div>
                  <div className="pr-1">
                    <h2 className={titleClasses}>{title}</h2>
                    <ul className={bodyClasses}>
                      {bullets.map((bp, idx) => <li key={idx}>{bp}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          }

          if (selectedDesign.layout === "title-band") {
            return (
              <div className={`rounded-2xl shadow-xl h-full overflow-hidden ${selectedDesign.panelClass}`}>
                <div className="h-full overflow-auto">
                  <div className="px-6 py-4 bg-black/35 border-b border-white/20">
                    <h2 className={`text-3xl font-bold break-words underline decoration-2 underline-offset-4 ${selectedDesign.titleClass}`}>{title}</h2>
                  </div>
                  <div className={forExport ? "p-3" : "p-6"}>
                    <ul className={bodyClasses}>
                      {bullets.map((bp, idx) => <li key={idx}>{bp}</li>)}
                    </ul>
                    <div className="mt-4">{imageBlock}</div>
                    {imageNote}
                  </div>
                </div>
              </div>
            );
          }

          if (selectedDesign.layout === "cards") {
            return (
              <div className={`rounded-2xl ${forExport ? "p-2" : "p-5"} shadow-xl h-full overflow-hidden ${selectedDesign.panelClass}`}>
                <div className="h-full overflow-auto">
                      <h2 className={titleClasses}>{title}</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {bullets.slice(0, 4).map((bp, idx) => (
                      <div key={idx} className="rounded-lg p-3 bg-black/25 border border-white/15">
                        <p className={`text-sm ${selectedDesign.bodyClass}`}>{bp}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">{imageBlock}</div>
                  {imageNote}
                </div>
              </div>
            );
          }

          if (selectedDesign.layout === "minimal-left") {
            return (
              <div className="h-full">
                <div className="w-2 h-full absolute left-0 top-0 bg-white/35 rounded-full" />
                <div className={`rounded-2xl ${forExport ? "p-2" : "p-5"} ml-4 shadow-xl h-full overflow-hidden ${selectedDesign.panelClass}`}>
                  <div className="h-full overflow-auto">
                    <h2 className={`text-4xl font-semibold mb-5 break-words underline decoration-2 underline-offset-4 ${selectedDesign.titleClass}`}>{title}</h2>
                    <ul className={bodyClasses}>
                      {bullets.map((bp, idx) => <li key={idx}>{bp}</li>)}
                    </ul>
                    <div className="mt-4">{imageBlock}</div>
                    {imageNote}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className={`rounded-2xl ${forExport ? "p-2" : "p-5"} shadow-xl h-full overflow-hidden flex flex-col items-center text-center ${selectedDesign.panelClass}`}>
              <div className="h-full w-full overflow-auto flex flex-col items-center text-center">
                <h2 className={`text-4xl font-bold mb-4 break-words underline decoration-2 underline-offset-4 ${selectedDesign.titleClass}`}>{title}</h2>
                <ul className={`list-disc text-left pl-6 space-y-2 max-w-3xl break-words text-[15px] leading-relaxed ${selectedDesign.bodyClass}`}>
                  {bullets.map((bp, idx) => <li key={idx}>{bp}</li>)}
                </ul>
                <div className="mt-4 w-full">{imageBlock}</div>
                {imageNote}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const renderDesignSelector = () => (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 shadow">
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="block text-sm font-medium text-slate-200">
            Slide Design Template
          </label>
          <p className="text-xs text-slate-400">
            Selected design applies to both demo and AI slides.
          </p>
        </div>
        <button
          onClick={() => setShowTemplatePicker((prev) => !prev)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
          title={showTemplatePicker ? "Hide Templates" : "Show Templates"}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M12 2a10 10 0 100 20h1.5a2.5 2.5 0 000-5H12a5 5 0 010-10h.5a1.5 1.5 0 000-3H12zm-5 9.5A1.5 1.5 0 118.5 13 1.5 1.5 0 017 11.5zm3-4A1.5 1.5 0 1111.5 9 1.5 1.5 0 0110 7.5zm4 0A1.5 1.5 0 1115.5 9 1.5 1.5 0 0114 7.5z" />
          </svg>
        </button>
      </div>

      {showTemplatePicker ? (
        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-auto pr-1">
          {SLIDE_DESIGN_TEMPLATES.map((template) => {
            const isActive = template.id === slideDesignId;
            return (
              <button
                key={template.id}
                onClick={() => setSlideDesignId(template.id)}
                className={`rounded-md px-2 py-2 text-xs font-medium border transition ${
                  isActive
                    ? "bg-rose-600/80 text-white border-rose-300/60"
                    : "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
                }`}
                title={template.name}
              >
                {template.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row h-[100dvh] w-full bg-slate-950 text-white font-sans overflow-hidden overscroll-none">
      <div className="flex-1 min-h-0 flex flex-col w-full md:w-[58%]">
        <div
          className={`flex-1 flex flex-col items-center px-4 ${
            isChatMode ? "justify-start min-h-0" : "justify-center"
          }`}
        >
          {showWelcome ? (
            <div className="w-full max-w-xl text-center">
              <div className="inline-flex items-center gap-2 px-1 py-1 mb-3">
                <span className="text-base leading-none">🪄</span>
                <span className="text-3xl md font-semibold tracking-wide text-rose-500">DeckGenie</span>
              </div>
              <h1 className="text-base md:text-5xl font-semibold leading-tight mb-2 text-white">
                Hello there
              </h1>
              <p className="text-base md:text-lg mb-4 text-slate-300">
                What do you want me to generate today?
              </p>
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder={`Ask me something...`}
                className="w-full h-28 px-4 py-3 md:py-4 rounded-md border border-rose-400/50 bg-slate-900 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-rose-300/60 text-sm md:text-base resize-none overflow-y-auto"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-3 w-full py-2 md:py-3 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-500 transition text-sm md:text-base disabled:bg-rose-900/40 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              <button
                onClick={loadDemoSlides}
                className="mt-2 w-full py-2 md:py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-md font-semibold hover:bg-slate-700 transition text-sm md:text-base"
              >
                Load Demo Slides
              </button>

              <div className="mt-6 text-left">
                <p className="text-sm text-slate-300 mb-3">Quick Templates</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-auto pr-1">
                  {SLIDE_TEMPLATES.map((template) => (
                    <button
                      key={template.title}
                      onClick={() => applyTemplate(template.prompt)}
                      className="w-full text-left rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 hover:bg-slate-800 transition"
                    >
                      <p className="text-sm font-semibold text-rose-200">{template.title}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {template.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="w-full max-w-xl">
              <div className="inline-flex items-center gap-2 px-1 py-1 mb-3">
                <span className="text-base leading-none">🪄</span>
                <span className="text-sm font-bold tracking-wide text-rose-200">DeckGenie</span>
              </div>
              <textarea
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                placeholder="Ask me something..."
                className="w-full px-4 py-4 h-36 rounded-md border border-rose-400/50 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300/60 text-base resize-none overflow-y-auto"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-3 w-full py-3 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-500 transition text-base disabled:bg-rose-900/40 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              <button
                onClick={loadDemoSlides}
                className="mt-2 w-full py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-md font-semibold hover:bg-slate-700 transition text-base"
              >
                Load Demo Slides
              </button>
            </div>
          ) : (
            <div className="flex-1 min-h-0 w-full max-w-2xl flex flex-col overflow-y-auto px-4 pt-0 pb-4">
              <div className="sticky top-0 z-20 mb-3 -mx-4 px-4 py-3 bg-slate-950 border-b border-slate-800">
                <div className="w-full inline-flex items-center justify-between gap-3 px-1 py-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-lg leading-none">🪄</span>
                    <span className="text-base font-bold tracking-wide text-rose-200">DeckGenie</span>
                  </div>
                  <button
                    onClick={handleBackToHome}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  >
                    <span aria-hidden="true">←</span>
                    <span>Home</span>
                  </button>
                </div>
              </div>
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                    msg.type === "user"
                      ? "bg-rose-800/40 text-rose-100 self-end border border-rose-400/40"
                      : msg.text === "Thinking..."
                        ? "bg-amber-900/40 text-amber-100 self-start italic border border-amber-700"
                        : "bg-slate-800 text-slate-100 self-start border border-slate-700"
                  }`}
                >
                  <Markdown>{msg.text}</Markdown>
                  {msg.text !== "Thinking..." ? (
                    <div className="mt-1 text-[11px] opacity-70">
                      {formatChatTime(msg.createdAt)}
                    </div>
                  ) : null}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {!showWelcome && messages.length > 0 && (
          <div className="flex p-4 border-t border-slate-800 max-w-2xl w-full mx-auto gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-4 h-24 rounded-md border border-rose-400/50 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300/60 text-base resize-none overflow-y-auto"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-500 transition text-base disabled:bg-rose-900/40 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        )}

        {showPPT && slides.length > 0 && (
          <div className="md:hidden flex justify-center mb-4">
            <button
              onClick={() => setShowMobilePreview(true)}
              className="px-6 py-2 bg-rose-600 text-white font-semibold rounded-md hover:bg-rose-500"
            >
              View Slides
            </button>
          </div>
        )}
      </div>

      {showPPT && slides.length > 0 && (
        <div className="hidden md:flex w-[42%] flex-col p-4 gap-3 overflow-hidden">
          <div className="w-full rounded-xl border border-slate-700 bg-slate-900/80 p-1 grid grid-cols-2 gap-1">
            <button
              onClick={() => setRightPanelTab("preview")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                rightPanelTab === "preview"
                  ? "bg-rose-600 text-white"
                  : "bg-transparent text-slate-300 hover:bg-slate-800"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setRightPanelTab("settings")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                rightPanelTab === "settings"
                  ? "bg-rose-600 text-white"
                  : "bg-transparent text-slate-300 hover:bg-slate-800"
              }`}
            >
              Settings
            </button>
          </div>

          {rightPanelTab === "preview" ? (
            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <div
                  ref={slidePreviewRef}
                  className="relative w-full aspect-video max-h-full shrink-0 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ${slideBackgroundClass}`}
                  />

                  {renderSlidePreviewContent()}

                  <div className={`absolute bottom-4 right-6 font-medium ${slideCounterClass}`}>
                    {currentSlide + 1}/{slides.length}
                  </div>
                </div>
              </div>

              {currentImageRecommendation ? (
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Image Recommendations
                  </p>
                  <p className="mt-1 text-sm text-slate-200 line-clamp-2">
                    {currentImageRecommendation}
                  </p>
                </div>
              ) : null}

              <div className="flex gap-2 justify-center">
                <div className="relative group">
                  <button
                    onClick={startSlideshow}
                    disabled={slides.length === 0}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full font-medium shadow-lg bg-violet-600 text-white hover:bg-violet-500 disabled:bg-violet-900/40 disabled:cursor-not-allowed"
                    aria-label="Start slideshow"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M8 5v14l11-7zM4 5h2v14H4z" />
                    </svg>
                  </button>
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 opacity-0 group-hover:opacity-100 transition">
                    Slideshow...
                  </span>
                </div>

                <div className="relative group">
                  <button
                    onClick={openDownloadModal}
                    disabled={downloadLoading || slides.length === 0}
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full font-medium shadow-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-900/40 disabled:cursor-not-allowed"
                    aria-label={downloadLoading ? "Downloading" : "Download PPT"}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M11 3h2v9h3l-4 5-4-5h3V3zm-6 14h14v4H5v-4z" />
                    </svg>
                  </button>
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-slate-100 opacity-0 group-hover:opacity-100 transition">
                    {downloadLoading ? "Downloading..." : "Download"}
                  </span>
                </div>
                {!isDemoPreviewMode ? (
                  <button
                    onClick={handleUndoLastEdit}
                    disabled={undoStack.length === 0 || aiEditLoading}
                    className="px-5 py-2 rounded-full font-medium shadow-lg bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Undo
                  </button>
                ) : null}
                {!isEditingSlide ? (
                  <button
                    onClick={startEditingCurrentSlide}
                    className="px-5 py-2 rounded-full font-medium shadow-lg bg-rose-500 text-white hover:bg-rose-400"
                  >
                    Edit Slide
                  </button>
                ) : null}
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`px-6 py-2 rounded-full font-medium shadow-lg ${
                    currentSlide === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-slate-900 text-rose-200 border border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  &lt;
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  className={`px-6 py-2 rounded-full font-medium shadow-lg ${
                    currentSlide === slides.length - 1
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-slate-900 text-rose-200 border border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  &gt;
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto space-y-3 pr-1">
              {renderDesignSelector()}

              {!isDemoPreviewMode ? (
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 shadow">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    AI Edit Instruction
                  </label>
                  <textarea
                    value={aiEditInstruction}
                    onChange={(e) => setAiEditInstruction(e.target.value)}
                    placeholder="Example: shorten bullets and make tone more professional."
                    className="w-full h-16 rounded-md border border-rose-400/50 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300/60 resize-none overflow-y-auto"
                  />
                  <button
                    onClick={handleApplyAIEdit}
                    disabled={!aiEditInstruction.trim() || aiEditLoading || loading}
                    className="mt-2 px-4 py-2 rounded-md bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-500 disabled:bg-fuchsia-900/40 disabled:cursor-not-allowed"
                  >
                    {aiEditLoading ? "Applying AI Edit..." : "Apply AI Edit"}
                  </button>
                </div>
              ) : null}

              {!isDemoPreviewMode ? (
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 shadow">
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Slide Image Prompt
                  </label>
                  <textarea
                    value={imageInstruction}
                    onChange={(e) => setImageInstruction(e.target.value)}
                    placeholder="Example: close-up macro photo of red hibiscus flower."
                    className="w-full h-16 rounded-md border border-rose-400/50 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300/60 resize-none overflow-y-auto"
                  />
                  <button
                    onClick={handleGenerateSlideImage}
                    disabled={imageLoading || loading}
                    className="mt-2 px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-500 disabled:bg-sky-900/40 disabled:cursor-not-allowed"
                  >
                    {imageLoading ? "Generating Image..." : "Generate Slide Image"}
                  </button>
                </div>
              ) : null}

              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 shadow">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Preview Image Size
                </label>
                <input
                  type="range"
                  min={120}
                  max={300}
                  step={4}
                  value={previewImageHeight}
                  onChange={(e) => setPreviewImageHeight(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                {!isEditingSlide ? (
                  <button
                    onClick={handleStartEditFromSettings}
                    className="px-5 py-2 rounded-full font-medium shadow-lg bg-rose-500 text-white hover:bg-rose-400"
                  >
                    Edit Slide
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {showMobilePreview && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center p-4 z-50">
          <button
            onClick={() => setShowMobilePreview(false)}
            className="absolute top-4 right-4 text-white text-2xl font-bold"
          >
            x
          </button>

          <div className="w-full max-w-md h-[80%] bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-auto p-4 text-white">
            {isEditingSlide ? (
              <div className="space-y-3">
                <input
                  value={editableSlide.title}
                  onChange={(e) =>
                    setEditableSlide((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Slide title"
                  className="w-full rounded-md border border-rose-400/50 bg-slate-900 text-white placeholder-slate-400 px-3 py-2"
                />

                {editableSlide.bulletPoints.map((bp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={bp}
                      onChange={(e) => updateBullet(idx, e.target.value)}
                      placeholder={`Bullet ${idx + 1}`}
                      className="flex-1 rounded-md border border-rose-400/50 bg-slate-900 text-white placeholder-slate-400 px-3 py-2"
                    />
                    <button
                      onClick={() => removeBullet(idx)}
                      className="px-3 rounded-md bg-red-500 text-white"
                      title="Delete bullet"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                      </svg>
                    </button>
                  </div>
                ))}

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={addBullet}
                    className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-500"
                  >
                    Add Bullet
                  </button>
                  <button
                    onClick={saveCurrentSlideEdits}
                    className="px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditingCurrentSlide}
                    className="px-4 py-2 rounded-md bg-gray-500 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-white text-center">
                  {current ? getSlideTitle(current) : "Untitled Slide"}
                </h2>
                <ul className="text-slate-200">
                  {current
                    ? getSlideBulletPoints(current).map((bp, idx) => (
                        <li key={idx} className="mb-2">
                          {bp}
                        </li>
                      ))
                    : null}
                </ul>
                {current && currentImageUrl && !imageFailed ? (
                  <div className="w-full h-52 bg-slate-800 rounded-lg border border-slate-700 mt-3 overflow-hidden flex items-center justify-center">
                    <img
                      src={currentImageUrl}
                      alt={getSlideImageDescription(current) || "Slide image"}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onLoad={() => setImageFailed(false)}
                      onError={() => {
                        if (imageCandidateIndex < currentImageCandidates.length - 1) {
                          setImageCandidateIndex((prev) => prev + 1);
                          return;
                        }
                        setImageFailed(true);
                      }}
                    />
                  </div>
                ) : null}
                {current && currentImageUrl && imageFailed ? (
                  <p className="mt-3 text-sm text-slate-300">
                    Image could not be loaded. Try Generate Slide Image again.
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div className="w-full max-w-md mt-4 space-y-3">
            {renderDesignSelector()}

            {!isDemoPreviewMode ? (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  AI Edit Instruction
                </label>
                <textarea
                  value={aiEditInstruction}
                  onChange={(e) => setAiEditInstruction(e.target.value)}
                  placeholder="Example: simplify this slide for beginners."
                  className="w-full h-16 rounded-md border border-rose-400/50 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 resize-none overflow-y-auto"
                />
                <button
                  onClick={handleApplyAIEdit}
                  disabled={!aiEditInstruction.trim() || aiEditLoading || loading}
                  className="mt-2 px-4 py-2 rounded-md bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-500 disabled:bg-fuchsia-900/40 disabled:cursor-not-allowed"
                >
                  {aiEditLoading ? "Applying AI Edit..." : "Apply AI Edit"}
                </button>
              </div>
            ) : null}

            {!isDemoPreviewMode ? (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Slide Image Prompt
                </label>
                <textarea
                  value={imageInstruction}
                  onChange={(e) => setImageInstruction(e.target.value)}
                  placeholder="Example: hibiscus flower photo, natural light, close-up."
                  className="w-full h-16 rounded-md border border-rose-400/50 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-400 resize-none overflow-y-auto"
                />
                <button
                  onClick={handleGenerateSlideImage}
                  disabled={imageLoading || loading}
                  className="mt-2 px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-500 disabled:bg-sky-900/40 disabled:cursor-not-allowed"
                >
                  {imageLoading ? "Generating Image..." : "Generate Slide Image"}
                </button>
              </div>
            ) : null}

            <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={openDownloadModal}
              disabled={downloadLoading || slides.length === 0}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full font-medium bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-900/40 disabled:cursor-not-allowed"
              title={downloadLoading ? "Downloading..." : "Download PPT"}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M11 3h2v9h3l-4 5-4-5h3V3zm-6 14h14v4H5v-4z" />
              </svg>
            </button>
            {!isDemoPreviewMode ? (
              <button
                onClick={handleUndoLastEdit}
                disabled={undoStack.length === 0 || aiEditLoading}
                className="px-6 py-2 rounded-full font-medium bg-gray-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Undo
              </button>
            ) : null}
            {!isEditingSlide ? (
              <button
                onClick={startEditingCurrentSlide}
                className="px-6 py-2 rounded-full font-medium bg-rose-500 text-white hover:bg-rose-400"
              >
                Edit Slide
              </button>
            ) : null}

            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`px-6 py-2 rounded-full font-medium ${
                currentSlide === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-slate-900 text-rose-200 border border-slate-700"
              }`}
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`px-6 py-2 rounded-full font-medium ${
                currentSlide === slides.length - 1
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-slate-900 text-rose-200 border border-slate-700"
              }`}
            >
              &gt;
            </button>
            </div>
          </div>
        </div>
      )}

      {showSlideshow ? (
        <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col p-4">
          <div className="flex items-center justify-between text-white mb-3">
            <p className="text-sm text-slate-300">
              Slideshow · {currentSlide + 1}/{slides.length}
            </p>
            <button
              onClick={stopSlideshow}
              className="px-3 py-1 rounded-md bg-slate-800 border border-slate-600 hover:bg-slate-700"
            >
              Close
            </button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="relative w-[92vw] max-w-[1700px] aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <div
                className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ${slideBackgroundClass}`}
              />
              {renderSlidePreviewContent(false, true)}
              <div className={`absolute bottom-4 right-6 font-medium ${slideCounterClass}`}>
                {currentSlide + 1}/{slides.length}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`px-6 py-2 rounded-full font-medium ${
                currentSlide === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-slate-900 text-rose-200 border border-slate-700 hover:bg-slate-800"
              }`}
            >
              &lt;
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`px-6 py-2 rounded-full font-medium ${
                currentSlide === slides.length - 1
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-slate-900 text-rose-200 border border-slate-700 hover:bg-slate-800"
              }`}
            >
              &gt;
            </button>
          </div>
        </div>
      ) : null}

      {showDownloadModal ? (
        <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Download Options</h3>
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setShowEditableDownloadWarning(false);
                }}
                className="text-slate-300 hover:text-white text-xl leading-none"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-300">
              Choose how you want to export the presentation.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={handleNonEditableDownload}
                disabled={downloadLoading}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium hover:bg-emerald-500 disabled:bg-emerald-900/40 disabled:cursor-not-allowed"
              >
                Non-editable (Exact Preview)
              </button>

              <button
                onClick={handleEditableDownloadClick}
                disabled={downloadLoading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:cursor-not-allowed"
              >
                Editable PPT
              </button>
            </div>

            {showEditableDownloadWarning ? (
              <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-900/20 p-3">
                <p className="text-sm text-amber-100">
                  Editable PPT may not preserve preview design exactly (gradients, layout, and styling can differ).
                </p>
                <button
                  onClick={confirmEditableDownload}
                  disabled={downloadLoading}
                  className="mt-3 w-full rounded-md bg-amber-600 px-4 py-2 font-medium hover:bg-amber-500 disabled:bg-amber-900/40 disabled:cursor-not-allowed"
                >
                  Continue Editable Download
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {slides.length > 0 ? (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: "-2000px",
            width: "1333px",
            height: "750px",
            opacity: 1,
            pointerEvents: "none",
            zIndex: 2147483647,
            overflow: "hidden",
          }}
        >
          <div
            ref={exportSlideRef}
            style={{
              position: "relative",
              width: "1333px",
              height: "750px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "24px",
            }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ${slideBackgroundClass}`}
            />
            {renderSlidePreviewContent(true)}
            <div className={`absolute bottom-4 right-6 font-medium ${slideCounterClass}`}>
              {currentSlide + 1}/{slides.length}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
