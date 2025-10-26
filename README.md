AI Slide Chat

AI Slide Chat is a web application that lets users interact with an AI to generate text-based content or structured slide decks. It supports multi-line prompts, dynamic slide previews, and PPT-style navigation.

Features

Interactive AI chat interface.

Multi-line text input for complex prompts.

PPT-style slide preview with Previous/Next navigation.

Customizable slide appearance (colors, font size, bullet points, images).

Placeholder images for slides without an image.

Technologies Used

React / Next.js

Tailwind CSS

Markdown-to-JSX for rendering Markdown

Fetch API for communicating with AI backend

Project Setup

Clone the repository:

git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>


Install dependencies:

npm install
# or
yarn install


Run the development server:

npm run dev
# or
yarn dev


Open http://localhost:3000
 in your browser.

Usage Instructions

Enter your prompt in the input box.

Press Enter or click Generate/Send.

If your prompt is slide-related (like “create 3 slides about JavaScript Closures”), a PPT-style preview will appear on the right.

Navigate through slides using Previous and Next buttons.

For chat-like prompts, AI responses appear as messages below the input box.

Example Prompt
Create 3 slides about JavaScript Closures.
For each slide, provide:
- Slide content (title, bullet points)
- Background color (WHITE)
- Text color (YELLOW)
- Font size (small, medium, large)
- Optional image description
Format as JSON.

Assumptions

The AI backend returns valid JSON formatted slides.

Multi-line input is supported for complex prompts.

Slide images are optional; placeholder images are used when missing.

Deployment

The app can be deployed on Vercel, Netlify, or any hosting service that supports Next.js/React.
