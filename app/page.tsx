// app/page.js (or page.tsx)
import ChatWindow from "../components/ChatWindow";

export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "Inter, system-ui, Arial" }}>
      {/* <h1 style={{ marginBottom: 12 }}>AI Slide Chat — Step 1</h1> */}
      <ChatWindow />
    </main>
  );
}
