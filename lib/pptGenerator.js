export function parseSlidesFromAI(text) {
  const slides = text
    .split(/Slide\s*\d+/i) // split by “Slide 1”, “Slide 2”, etc.
    .map(slide => slide.trim())
    .filter(slide => slide && !slide.toLowerCase().includes('slide break'));
  return slides;
}
