"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PPTPreview({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <div className="text-gray-500 text-center mt-4">
        No slides available yet.
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  const goNext = () => {
    if (currentIndex < slides.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 rounded-2xl shadow-2xl">
      {/* Slide Container */}
      <div className="bg-white w-[900px] h-[500px] p-10 rounded-2xl shadow-lg flex flex-col justify-center transition-all duration-500 ease-in-out">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
          {currentSlide.title || `Slide ${currentIndex + 1}`}
        </h2>
        <div className="text-lg leading-relaxed text-gray-800 overflow-y-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {currentSlide.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all ${
            currentIndex === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          ⬅ Previous
        </button>
        <span className="text-white font-semibold text-lg">
          {currentIndex + 1} / {slides.length}
        </span>
        <button
          onClick={goNext}
          disabled={currentIndex === slides.length - 1}
          className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all ${
            currentIndex === slides.length - 1
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
