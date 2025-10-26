"use client";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{
        maxWidth: "75%",
        background: isUser ? "#DFF7D8" : "#F1F3F5", // <-- changed from #ffffff
        padding: 10,
        borderRadius: 8,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        color: "#000" // ensures text is visible
      }}>
        <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{message.text}</div>
      </div>
    </div>
  );
}
