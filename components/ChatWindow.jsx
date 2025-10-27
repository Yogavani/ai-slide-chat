"use client";
import React, { useState, useRef, useEffect } from "react";
import Markdown from "markdown-to-jsx";

// --- Function to parse AI slides safely ---
function parseAISlides(aiResponseText) {
  try {
    const cleaned = aiResponseText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // ✅ Support both { slides: [...] } and plain [...] arrays
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed && Array.isArray(parsed.slides)) {
      return parsed.slides;
    } else {
      console.error("Unexpected AI response format:", parsed);
      return [];
    }
  } catch (err) {
    console.error("Failed to parse AI slides:", err);
    return [];
  }
}


export default function ChatWindow() {
const [prompt, setPrompt] = useState("");
const [messages, setMessages] = useState([]);
const [slides, setSlides] = useState([]);
const [currentSlide, setCurrentSlide] = useState(0);
const [loading, setLoading] = useState(false);
const [showPPT, setShowPPT] = useState(false);
const [showWelcome, setShowWelcome] = useState(true);
const [showMobilePreview, setShowMobilePreview] = useState(false);

const chatEndRef = useRef(null);

const handleGenerate = async () => {
if (!prompt.trim()) return;


if (showWelcome) setShowWelcome(false);

const userMessage = { type: "user", text: prompt };
setMessages((prev) => [...prev, userMessage]);
setPrompt("");
setLoading(true);
setSlides([]);
setCurrentSlide(0);

const isPPT = /ppt|slide|presentation/i.test(userMessage.text);
setShowPPT(isPPT);

try {
  const thinkingMessage = { type: "ai", text: "Thinking..." };
  setMessages((prev) => [...prev, thinkingMessage]);

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userMessage.text }),
  });
  const data = await res.json();

  setMessages((prev) => prev.filter((msg) => msg.text !== "Thinking..."));

  if (data?.text) {
    const parsedSlides = parseAISlides(data.text);
    setSlides(parsedSlides);

    if (!isPPT && parsedSlides.length > 0) {
      const textContent = parsedSlides
        .map(
          (s) =>
            s.slide_content.title +
            "\n" +
            s.slide_content.bullet_points.join("\n")
        )
        .join("\n\n");
      setMessages((prev) => [...prev, { type: "ai", text: textContent }]);
    }
  }
} catch (err) {
  console.error("Error generating slides:", err);
  setMessages((prev) =>
    prev
      .filter((msg) => msg.text !== "Thinking...")
      .concat({ type: "ai", text: "Error generating slides" })
  );
} finally {
  setLoading(false);
}


};

const nextSlide = () => {
if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
};

const prevSlide = () => {
if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
};

useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

const current = slides[currentSlide];


return ( <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-50 font-sans overflow-hidden">
{/* Chat Section */} <div className="flex-1 flex flex-col w-full md:w-2/3"> <div className="flex-1 flex flex-col justify-center items-center px-4">
{showWelcome ? ( <div className="w-full max-w-xl text-center"> <h1 className="text-3xl font-bold mb-2 text-gray-800">HELLO, USER</h1> <p className="text-lg mb-4 text-gray-700">
What do you want me to generate today? </p>
<textarea
value={prompt}
onChange={(e) => setPrompt(e.target.value)}
onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
placeholder={`Ask me something....
NOTE: You should ask templates only
Example Prompt: Create 3 slides about JavaScript Closures.
For each slide, provide:
* Slide content (title, bullet points)
* Background color (WHITE)
* Text color (YELLOW)
* Font size (small, medium, large)
* Optional image description
  Format as JSON.`}
                className="w-full px-4 py-3 md:py-4 rounded-md border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base resize-none"
              />             <button
                onClick={handleGenerate}
                className="mt-3 w-full py-2 md:py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition text-sm md:text-base"             >
                Generate             </button>           </div>
          ) : messages.length === 0 ? (           <div className="w-full max-w-xl">             <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Ask me something..."
                className="w-full px-4 py-4 h-65 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
              />             <button
                onClick={handleGenerate}
                className="mt-3 w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition text-base"             >
                Generate             </button>           </div>
          ) : (           <div className="flex-1 w-full max-w-2xl flex flex-col overflow-auto px-4 py-4">
              {messages.map((msg, idx) => (               <div
                  key={idx}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] ${
  msg.type === "user"
  ? "bg-blue-100 text-blue-900 self-end"
  : msg.text === "Thinking..."
  ? "bg-yellow-100 text-yellow-900 self-start italic"
  : "bg-gray-200 text-gray-900 self-start"
  }`}
  > <Markdown>{msg.text}</Markdown> </div>
  ))} <div ref={chatEndRef} /> </div>
  )} </div>

  
    {!showWelcome && messages.length > 0 && (
      <div className="flex p-4 border-t border-gray-300 max-w-2xl w-full mx-auto gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-4 h-32 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
        />
        <button
          onClick={handleGenerate}
          className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-base"
        >
          Send
        </button>
      </div>
    )}

    {/* Mobile: show preview toggle button */}
    {showPPT && slides.length > 0 && (
      <div className="md:hidden flex justify-center mb-4">
        <button
          onClick={() => setShowMobilePreview(true)}
          className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-md"
        >
          View Slides
        </button>
      </div>
    )}
  </div>

  {/* PPT Preview Section - desktop */}
  {showPPT && slides.length > 0 && (
    <div className="hidden md:flex w-1/3 flex-col items-center justify-center p-4 space-y-4">
      <div className="relative w-full max-w-xl md:max-w-3xl h-[70%] rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-full transition-all duration-500 bg-gradient-to-br ${
            currentSlide % 2 === 0
              ? "from-indigo-700 to-violet-700"
              : "from-purple-700 to-pink-700"
          }`}
        />
        {current && (
          <div className="relative w-full h-full p-6 overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {current?.slide_content?.title || "Untitled Slide"}
            </h2>
            <ul className="text-white">
  {(current.slide_content?.bullet_points || current.content || []).map((bp, idx) => (
    <li key={idx} className="mb-2">
      {typeof bp === "string" ? bp : bp.text || JSON.stringify(bp)}
    </li>
  ))}
</ul>

          </div>
        )}
        <div className="absolute bottom-4 right-6 text-white font-medium">
          {currentSlide + 1}/{slides.length}
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`px-6 py-2 rounded-full font-medium shadow-lg ${
            currentSlide === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white text-violet-700 hover:bg-gray-100"
          }`}
        >
          Previous
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`px-6 py-2 rounded-full font-medium shadow-lg ${
            currentSlide === slides.length - 1
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white text-violet-700 hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )}

  {/* Mobile overlay for preview */}
  {showMobilePreview && (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
      <button
        onClick={() => setShowMobilePreview(false)}
        className="absolute top-4 right-4 text-white text-2xl font-bold"
      >
        ✕
      </button>
      <div className="w-full max-w-md h-[80%] bg-white rounded-lg shadow-lg overflow-auto p-4">
        {current && (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              {current?.slide_content?.title || "Untitled Slide"}
            </h2>
            <ul className="text-gray-700">
              {current.slide_content.bullet_points.map((bp, idx) => (
                <li key={idx} className="mb-2">
                  {bp}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`px-6 py-2 rounded-full font-medium ${
            currentSlide === 0
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white text-violet-700"
          }`}
        >
          Previous
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className={`px-6 py-2 rounded-full font-medium ${
            currentSlide === slides.length - 1
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-white text-violet-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )}
  

    </div>
  );

}
